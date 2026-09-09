import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const listeners = new Set();
    const storageListeners = new Set();
    const settings = { enabled: true, translationMode: 'automatic', siteModes: {} };
    const harness = {
      requests: [],
      delay: 0,
      message(message) {
        for (const fn of listeners) fn(message, {}, () => {});
      },
      update(patch) {
        const changes = {};
        for (const [key, value] of Object.entries(patch)) {
          changes[key] = { oldValue: settings[key], newValue: value };
          settings[key] = value;
        }
        for (const fn of storageListeners) fn(changes, 'sync');
      },
    };
    window.testHarness = harness;
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text) => {
          harness.copiedText = text;
        },
      },
    });
    window.chrome = {
      runtime: {
        id: 'isolated-regression-test',
        getManifest: () => ({ version: '2.0.0' }),
        onMessage: {
          addListener: (fn) => {
            listeners.add(fn);
            harness.ready = true;
          },
          removeListener: (fn) => listeners.delete(fn),
        },
        async sendMessage(message) {
          if (message.type === 'GET_TOP_LEVEL_SITE_CONTEXT') return { origin: location.origin };
          if (message.type === 'TRANSLATE_TEXT') {
            harness.requests.push(message.text);
            await new Promise((resolve) => setTimeout(resolve, harness.delay));
            return { ok: true, result: { translation: "I won't go today.", message: '' } };
          }
        },
      },
      storage: {
        sync: { get: async () => ({ ...settings }) },
        onChanged: {
          addListener: (fn) => storageListeners.add(fn),
          removeListener: (fn) => storageListeners.delete(fn),
        },
      },
    };
  });
  await page.goto('/browser-tests/controller.html');
  // Module loading completes before input events are sent.
  await page.waitForFunction(() => window.testHarness?.ready);
});

const card = (page) =>
  page.getByRole('complementary', { name: 'ToneBridge translation suggestion' });

test('automatic translation, replace, edit and undo', async ({ page }) => {
  await page.locator('#first').fill('ami ajke jabo na');
  await page.getByRole('button', { name: 'Replace', exact: true }).click();
  await expect(page.locator('#first')).toHaveValue("I won't go today.");
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('#first')).toHaveValue('ami ajke jabo na');
  await page.locator('#first').fill('ami kalke jabo');
  await expect(page.getByRole('button', { name: 'Replace', exact: true })).toBeVisible();
});

test('switching fields hides the old suggestion', async ({ page }) => {
  await page.locator('#first').fill('ami ajke jabo na');
  await expect(page.getByRole('button', { name: 'Replace', exact: true })).toBeVisible();
  await page.locator('#second').focus();
  await expect(card(page)).toBeHidden();
  await expect(page.locator('#second')).toHaveValue('');
});

test('manual shortcut stays visible after keyup and never translates typing', async ({ page }) => {
  await page.evaluate(() => window.testHarness.update({ translationMode: 'manual' }));
  await page.locator('#rich').fill('ami ajke jabo na');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.testHarness.requests.length)).toBe(0);
  await page.evaluate(() => window.testHarness.message({ type: 'TRANSLATE_FOCUSED_EDITOR' }));
  await expect(page.getByRole('button', { name: 'Replace', exact: true })).toBeVisible();
  await page.locator('#rich').dispatchEvent('keyup', { key: 'Shift' });
  await expect(card(page)).toBeVisible();
});

test('disabled site sends no translation, including shortcuts', async ({ page }) => {
  await page.evaluate(() =>
    window.testHarness.update({ siteModes: { [location.origin]: 'disabled' } }),
  );
  await page.locator('#first').fill('ami ajke jabo na');
  await page.evaluate(() => window.testHarness.message({ type: 'TRANSLATE_FOCUSED_EDITOR' }));
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.testHarness.requests.length)).toBe(0);
  await expect(card(page)).toBeHidden();
});

test('composition does not send partial Bangla input', async ({ page }) => {
  await page.locator('#first').focus();
  await page.locator('#first').dispatchEvent('compositionstart');
  await page.locator('#first').fill('আমি যাব না');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.testHarness.requests.length)).toBe(0);
  await page.locator('#first').dispatchEvent('compositionend');
  await expect(page.getByRole('button', { name: 'Replace', exact: true })).toBeVisible();
});

test('late response cannot reopen a dismissed suggestion', async ({ page }) => {
  await page.evaluate(() => {
    window.testHarness.delay = 500;
  });
  await page.locator('#first').fill('ami ajke jabo na');
  await expect.poll(() => page.evaluate(() => window.testHarness.requests.length)).toBe(1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(650);
  await expect(card(page)).toBeHidden();
});

test('preference notification clears cached translations', async ({ page }) => {
  await page.locator('#first').fill('ami ajke jabo na');
  await expect(page.getByRole('button', { name: 'Replace', exact: true })).toBeVisible();
  await page.evaluate(() => window.testHarness.message({ type: 'PREFERENCES_CHANGED' }));
  await expect(card(page)).toBeHidden();
  await page.evaluate(() => window.testHarness.message({ type: 'TRANSLATE_FOCUSED_EDITOR' }));
  await expect.poll(() => page.evaluate(() => window.testHarness.requests.length)).toBe(2);
});

test('Copy leaves the original editor unchanged', async ({ page }) => {
  await page.locator('#first').fill('ami ajke jabo na');
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  expect(await page.evaluate(() => window.testHarness.copiedText)).toBe("I won't go today.");
  await expect(page.locator('#first')).toHaveValue('ami ajke jabo na');
});

test('programmatic source changes discard late output without a stuck loader', async ({ page }) => {
  await page.evaluate(() => {
    window.testHarness.delay = 500;
  });
  await page.locator('#first').fill('ami ajke jabo na');
  await expect.poll(() => page.evaluate(() => window.testHarness.requests.length)).toBe(1);
  await page.evaluate(() => {
    document.querySelector('#first').value = 'a different draft';
  });
  await page.waitForTimeout(650);
  await expect(card(page)).toBeHidden();
  await expect(page.locator('#first')).toHaveValue('a different draft');
});

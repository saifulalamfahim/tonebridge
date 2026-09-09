import { chromium, test, expect } from '@playwright/test';
import { resolve } from 'node:path';

test('production MV3 package loads, injects and enforces background controls', async () => {
  const extensionPath = resolve('dist');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    const extensionId = new URL(worker.url()).host;
    const editorPage = await context.newPage();
    await editorPage.goto('http://127.0.0.1:4174/browser-tests/index.html');
    await expect(editorPage.locator('#tonebridge-extension-root')).toBeAttached();
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup).toHaveTitle(/ToneBridge/);
    await worker.evaluate(() => chrome.storage.sync.set({ enabled: false }));
    const disabled = await popup.evaluate(() =>
      chrome.runtime.sendMessage({ type: 'TRANSLATE_TEXT', text: 'ami jabo na' }),
    );
    expect(disabled.error.code).toBe('TRANSLATION_DISABLED');
    await worker.evaluate(() => chrome.storage.sync.set({ enabled: true }));
    const missingKey = await popup.evaluate(() =>
      chrome.runtime.sendMessage({ type: 'TRANSLATE_TEXT', text: 'ami jabo na' }),
    );
    expect(missingKey.error.code).toBe('MISSING_API_KEY');
    // This profile has no provider credentials: no external model request occurs.
  } finally {
    await context.close();
  }
});

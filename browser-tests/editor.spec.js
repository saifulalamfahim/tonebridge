import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/browser-tests/index.html');
});

test('actual editor module passes browser assertions', async ({ page }) => {
  await page.getByRole('button', { name: 'Run browser assertions' }).click();
  await expect(page.locator('#result')).not.toContainText('FAIL');
  await expect(page.locator('#result')).toContainText('PASS: password');
});

for (const id of ['plain', 'area', 'rich']) {
  test(`${id}: replacement remains keyboard editable and selectable`, async ({ page }) => {
    const editor = page.locator(`#${id}`);
    await editor.focus();
    await page.getByRole('button', { name: 'Replace in focused editor' }).click();
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('Edited with a real keyboard.');
    if (id === 'rich') await expect(editor).toHaveText('Edited with a real keyboard.');
    else await expect(editor).toHaveValue('Edited with a real keyboard.');
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    if (id === 'rich') await expect(editor).toHaveText('');
    else await expect(editor).toHaveValue('');
  });
}

test('undo restores the original paragraphs', async ({ page }) => {
  const editor = page.locator('#rich');
  const original = await editor.innerText();
  await editor.focus();
  await page.getByRole('button', { name: 'Replace in focused editor' }).click();
  await page.getByRole('button', { name: 'Undo replacement' }).click();
  await expect.poll(() => editor.innerText()).toBe(original);
});

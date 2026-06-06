import { test, expect } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';

test('save a project, reload, then load it back', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1500);

  // build a small scene
  await page.getByTestId('add-character').click();
  await page.getByTestId('add-character').click();
  const rows = page.getByTestId('char-list').locator('.char-row');
  await expect(rows).toHaveCount(2);
  await rows.nth(0).click();
  await page.getByTestId('pose-select').selectOption('walking');

  // save -> capture the downloaded JSON
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('save-project').click(),
  ]);
  const file = path.join(os.tmpdir(), 'director-project-test.json');
  await download.saveAs(file);

  // reload: fresh store, no characters
  await page.reload();
  await page.waitForTimeout(1000);
  await expect(page.getByTestId('char-list').locator('.char-row')).toHaveCount(0);

  // load the saved file via the hidden project input
  await page.locator('input[accept*="json"]').setInputFiles(file);
  const reloaded = page.getByTestId('char-list').locator('.char-row');
  await expect(reloaded).toHaveCount(2);

  // the first character's pose survived the round-trip
  await reloaded.nth(0).click();
  await expect(page.getByTestId('pose-select')).toHaveValue('walking');
});

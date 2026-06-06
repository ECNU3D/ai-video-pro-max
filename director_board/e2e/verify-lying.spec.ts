import { test, expect } from '@playwright/test';
import path from 'node:path';

const SHOT = (n: string) => path.join('e2e', '__screenshots__', n);

const setRange = (page: import('@playwright/test').Page, testid: string, value: number) =>
  page.getByTestId(testid).evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, String(v));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);

test('lying pose renders a horizontal figure across the view', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1500);

  await page.getByTestId('add-character').click();
  const rows = page.getByTestId('char-list').locator('.char-row');
  await rows.nth(0).click();
  await page.getByTestId('pose-select').selectOption('lying');
  // yaw 90° so the supine body lies left-right across the camera, fully visible
  await setRange(page, 'yaw-input', Math.PI / 2);
  const yaw = Number(await page.getByTestId('yaw-input').inputValue());
  expect(Math.abs(yaw)).toBeGreaterThan(1.5);

  await page.mouse.click(20, 400); // deselect
  await page.waitForTimeout(500);
  await page.screenshot({ path: SHOT('lying.png') });
});

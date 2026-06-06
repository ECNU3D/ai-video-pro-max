import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SHOT_DIR = path.join('e2e', '__screenshots__');

// console/page errors that are noise rather than real failures
const BENIGN = [/React DevTools/i, /WebGL.*performance/i, /GPU stall/i];

function isBenign(msg: string) {
  return BENIGN.some((re) => re.test(msg));
}

test('director board: load, add posed characters, export a frame', async ({ page }) => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });

  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !isBenign(m.text())) errors.push(`console: ${m.text()}`);
  });

  await page.goto('/');

  // canvas mounts and the example panorama paints
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SHOT_DIR, '01-loaded.png') });

  // add two characters
  await page.getByTestId('add-character').click();
  await page.getByTestId('add-character').click();

  const rows = page.getByTestId('char-list').locator('.char-row');
  await expect(rows).toHaveCount(2);

  // distinct colors
  const color0 = await rows.nth(0).locator('.swatch').evaluate((el) => getComputedStyle(el).backgroundColor);
  const color1 = await rows.nth(1).locator('.swatch').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(color0).not.toBe(color1);
  await page.screenshot({ path: path.join(SHOT_DIR, '02-two-chars.png') });

  // pose the two differently
  await rows.nth(0).click();
  await page.getByTestId('pose-select').selectOption('standing');
  await rows.nth(1).click();
  await page.getByTestId('pose-select').selectOption('sitting');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOT_DIR, '03-poses.png') });

  // switch to rotate mode and nudge facing — gizmo should be active
  await page.getByTestId('mode-rotate').click();
  await expect(page.getByTestId('mode-rotate')).toHaveClass(/active/);
  await page.getByTestId('yaw-input').evaluate((el) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, '1.2');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOT_DIR, '04-rotate.png') });

  // the canvas is actually rendering (non-trivial PNG, not a blank buffer)
  const dataUrl = await canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL('image/png'));
  expect(dataUrl.startsWith('data:image/png')).toBe(true);
  expect(dataUrl.length).toBeGreaterThan(20_000);

  // export a flat PNG via the toolbar and validate the downloaded file
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('export-png').click(),
  ]);
  const exportPath = path.join(SHOT_DIR, 'export.png');
  await download.saveAs(exportPath);
  const buf = fs.readFileSync(exportPath);
  expect(buf.length).toBeGreaterThan(5000);
  // PNG magic bytes
  expect([...buf.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // delete one character to exercise removal
  await rows.nth(1).getByRole('button').click();
  await expect(page.getByTestId('char-list').locator('.char-row')).toHaveCount(1);

  expect(errors, `unexpected errors:\n${errors.join('\n')}`).toEqual([]);
});

import { test, expect } from '@playwright/test';

const frame = (page: import('@playwright/test').Page) =>
  page.locator('canvas').evaluate((el) => (el as HTMLCanvasElement).toDataURL('image/png'));

test('camera look-around and FOV zoom change the rendered frame', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);

  const box = (await page.locator('canvas').boundingBox())!;
  const cx = box.x + box.width / 2;
  const topY = box.y + box.height * 0.2; // empty panorama region, no puppets

  const before = await frame(page);

  // drag horizontally to orbit the view
  await page.mouse.move(cx, topY);
  await page.mouse.down();
  await page.mouse.move(cx + 300, topY, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  const afterDrag = await frame(page);
  expect(afterDrag).not.toBe(before);

  // wheel zoom (FOV) changes the frame too
  await page.mouse.move(cx, topY);
  await page.mouse.wheel(0, -400);
  await page.waitForTimeout(300);
  const afterZoom = await frame(page);
  expect(afterZoom).not.toBe(afterDrag);
});

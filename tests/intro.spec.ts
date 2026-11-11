import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'portfolio.test') return route.abort();
    const root = resolve('dist');
    const file = resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + sep)) return route.abort();
    const contentType = file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.png') ? 'image/png' : 'text/html';
    try { await route.fulfill({ body: await readFile(file), contentType }); }
    catch { await route.fulfill({ status: 404 }); }
  });
});

for (const width of [390, 1440]) {
  test(`intro lands on navbar without moving page content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await page.goto('/');
    const intro = page.getByRole('region', { name: 'Amine Moutaki portfolio introduction' });
    await expect(intro).toBeVisible();
    await expect(page.locator('.site-shell')).toHaveAttribute('inert', '');
    const original = await page.locator('.hero').evaluate(node => ({ width: node.getBoundingClientRect().width, left: node.getBoundingClientRect().left }));
    await expect(page.locator('.navbar .logo')).toHaveCSS('visibility', 'hidden');
    await page.clock.runFor(900);
    await page.screenshot({ path: `test-results/intro-${width}-name.png` });
    await page.clock.runFor(900);
    await expect(intro).toHaveAttribute('data-phase', 'moving');
    await page.clock.runFor(400);
    await expect(intro).toHaveAttribute('data-phase', 'revealing');
    const boxes = await page.locator('.navbar .logo, .intro-logo').evaluateAll(nodes => nodes.map(node => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    }));
    for (const key of ['x', 'y', 'width', 'height'] as const) expect(boxes[0][key]).toBeCloseTo(boxes[1][key], 0);
    await page.screenshot({ path: `test-results/intro-${width}-landing.png` });
    await page.clock.runFor(500);
    await expect(intro).toHaveCount(0);
    await expect(page.locator('.navbar .logo')).toBeVisible();
    await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    const final = await page.locator('.hero').evaluate(node => ({ width: node.getBoundingClientRect().width, left: node.getBoundingClientRect().left }));
    expect(final).toEqual(original);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.reload();
    await expect(intro).toBeVisible();
  });
}

test('skip is keyboard accessible and reveals the portfolio', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('button', { name: 'SKIP INTRO' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.intro-animation')).toHaveCount(0);
  await expect(page.locator('.hero')).toHaveCSS('opacity', '1');
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.getByRole('link', { name: 'Amine Moutaki, home' })).toBeFocused();
  await page.getByRole('button', { name: 'DOWNLOAD CV' }).click();
  await expect(page.getByText('CV coming soon.')).toBeVisible();
});

test('reduced motion bypasses the intro while blocked storage still allows testing playback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.intro-animation')).toHaveCount(0);
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage unavailable'); } });
  });
  await page.reload();
  await expect(page.locator('.intro-animation')).toBeVisible();
  await page.getByRole('button', { name: 'SKIP INTRO' }).click();
  await expect(page.locator('.intro-animation')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Amine Moutaki, home' })).toBeVisible();
});

test('stored session history does not suppress the intro in replay mode', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('amine-portfolio-intro-seen', 'true'));
  await page.goto('/');
  await expect(page.locator('.intro-animation')).toBeVisible();
  await expect(page.locator('.intro-animation')).toHaveCSS('position', 'fixed');
  await expect(page.locator('.intro-animation')).toHaveCSS('z-index', '1000');
  await expect(page.locator('.intro-backdrop')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.getByRole('button', { name: 'SKIP INTRO' }).click();
  await expect(page.locator('.intro-animation')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.intro-animation')).toBeVisible();
});

test('resize and motion preference changes during playback remain usable', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto('/');
  await page.clock.runFor(1400);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.runFor(800);
  const boxes = await page.locator('.navbar .logo, .intro-logo').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().x));
  expect(boxes[0]).toBeCloseTo(boxes[1], 0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.intro-animation')).toHaveCount(0);
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
});

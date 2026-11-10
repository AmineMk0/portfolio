import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

// Serve the real production build through interception, even without network access.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'portfolio.test') return route.abort();
    const root = resolve('dist');
    const file = resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + sep)) return route.abort();
    const contentType = file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.png') ? 'image/png' : file.endsWith('.jpg') ? 'image/jpeg' : file.endsWith('.svg') ? 'image/svg+xml' : 'text/html';
    try { await route.fulfill({ body: await readFile(file), contentType }); } catch { await route.fulfill({ status: 404 }); }
  });
});

test('game awards XP, finishes after 30 seconds and persists best score', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'START GAME' }).click();
  await expect(page.getByRole('button', { name: 'Catch bug for 10 XP' })).toHaveCount(5);
  await page.getByRole('button', { name: 'Catch bug for 10 XP' }).first().click();
  await expect(page.getByTestId('score')).toHaveText('0010');
  await page.clock.fastForward(30_100);
  await expect(page.getByText('TIME’S UP!')).toBeVisible();
  await expect(page.getByTestId('best')).toHaveText('0010');
  await page.getByRole('button', { name: 'RESTART', exact: true }).first().click();
  await expect(page.getByTestId('score')).toHaveText('0000');
  await page.reload();
  await expect(page.getByTestId('best')).toHaveText('0010');
});

test('project details and CV notice work without fabricated URLs', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'View CarRent details' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'DOWNLOAD CV' }).click();
  await expect(page.getByText('CV coming soon.')).toBeVisible();
  expect(errors).toEqual([]);
});

for (const width of [320, 360, 390, 641, 768, 781, 900, 1024, 1089, 1440, 1920]) {
  test(`responsive layout at ${width}px has no overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width >= 901) {
      const layout = await page.evaluate(() => {
        const shell = document.querySelector('.site-shell')!.getBoundingClientRect();
        const sections = [...document.querySelectorAll('.navbar, .hero, .mini-game, .projects, .developer-lab, .system-panel, footer')].map(element => {
          const rect = element.getBoundingClientRect();
          return { left: rect.left, right: rect.right };
        });
        return { left: shell.left, right: shell.right, sections, portraitWidth: document.querySelector('.portrait-frame')!.getBoundingClientRect().width };
      });
      expect(layout.left).toBeCloseTo(24, 0);
      expect(width - layout.right).toBeCloseTo(24, 0);
      for (const section of layout.sections) {
        expect(section.left).toBeCloseTo(layout.sections[0].left, 0);
        expect(section.right).toBeCloseTo(layout.sections[0].right, 0);
      }
      expect(layout.portraitWidth).toBeLessThanOrEqual(250);
    }
    for (const img of await page.locator('img:visible').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    if (width <= 780) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.getByRole('link', { name: '03_PROJECTS' }).click();
      await expect(page).toHaveURL(/#projects$/);
    }
    if ([390, 1089, 1440, 1920].includes(width)) await page.screenshot({ path: `test-results/portfolio-${width}.png`, fullPage: true });
  });
}

for (const width of [390, 1440]) {
  test(`education timeline and navigation work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: width === 390 ? 'reduce' : 'no-preference' });
    await page.goto('/');

    const education = page.getByRole('region', { name: '// EDUCATION_JOURNEY' });
    const cards = education.getByRole('article');
    const connectors = education.locator('.education-connector');
    await expect(cards).toHaveCount(3);
    await expect(cards.locator('.education-number')).toHaveText(['01', '02', '03']);
    if (width === 390) {
      await expect(cards.first()).toHaveCSS('opacity', '1');
      await expect(connectors.first()).toHaveCSS('transform', 'none');
      await page.getByRole('button', { name: 'Open navigation' }).click();
    } else {
      await expect(cards.first()).toHaveCSS('opacity', '0');
    }

    const link = page.getByRole('link', { name: '06_EDUCATION' });
    await link.click();
    await expect(page).toHaveURL(/#education$/);
    await expect(education).toBeInViewport();
    if (width === 390) {
      await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
    }
    await expect(page.locator('a[href="#education"]')).toHaveAttribute('aria-current', 'location');
    await expect(cards.nth(0)).toContainText('2021');
    await expect(cards.nth(0)).toContainText('Baccalauréat Sciences Physiques');
    await expect(cards.nth(1)).toContainText('OFPPT');
    await expect(cards.nth(1)).toContainText('Diplôme de Technicien Spécialisé en Développement Digital');
    await expect(cards.nth(1)).toContainText('Full Stack Development');
    await expect(cards.nth(2)).toContainText('ESTEM');
    await expect(cards.nth(2)).toContainText('Licence en Génie Logiciel');
    const currentBadge = cards.nth(2).getByText('IN PROGRESS', { exact: true });
    await expect(currentBadge).toBeVisible();
    await expect(currentBadge).toHaveCSS('color', 'rgb(12, 121, 59)');
    await expect(education.getByText('Completed', { exact: true })).toHaveCount(2);
    await expect(cards.last()).toHaveCSS('opacity', '1');
    if (width === 1440) await expect(connectors.last()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');

    const [first, second] = await cards.evaluateAll(elements =>
      elements.map(element => {
        const { x, y } = element.getBoundingClientRect();
        return { x, y };
      }),
    );
    expect(first.x).toBe(second.x);
    expect(first.y).toBeLessThan(second.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await education.screenshot({ path: `test-results/education-${width}.png` });
  });
}

test('live code supports typing, pause, replay, viewport suspension and compilation', async ({ page }) => {
  test.setTimeout(60_000);
  await page.clock.install();
  await page.goto('/');
  const editor = page.getByRole('region', { name: 'Animated TypeScript demonstration' });
  await editor.scrollIntoViewIfNeeded();
  const code = editor.locator('pre');
  await expect.poll(async () => (await code.innerText()).length).toBeGreaterThan(20);
  await page.getByRole('button', { name: 'Pause code animation' }).click();
  const paused = await code.innerText();
  await page.clock.fastForward(1000);
  expect(await code.innerText()).toBe(paused);
  await page.getByRole('button', { name: 'Resume code animation' }).click();
  await page.clock.runFor(500);
  expect((await code.innerText()).length).toBeGreaterThan(paused.length);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.clock.runFor(100);
  const outsideViewport = await code.innerText();
  await page.clock.fastForward(2000);
  expect(await code.innerText()).toBe(outsideViewport);
  await editor.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Replay code animation' }).click();
  expect((await code.innerText()).length).toBeLessThan(outsideViewport.length);
  await expect(page.getByText('Compiled successfully', { exact: false })).toBeVisible({ timeout: 35_000 });
  await expect(page.getByText('> Developer: Amine Moutaki')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause code animation' })).toBeDisabled();
});

test('reduced motion shows complete code immediately in equal height lab panels', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByText('Compiled successfully', { exact: false })).toBeVisible();
  const heights = await page.locator('.lab-panel').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().height));
  expect(heights).toEqual([356, 356]);
  await page.getByRole('button', { name: 'Replay code animation' }).click();
  await expect(page.getByText('Compiled successfully', { exact: false })).toBeVisible();
  await page.getByRole('textbox', { name: 'Terminal command', exact: true }).fill('help');
  await page.getByRole('button', { name: 'Execute terminal command' }).click();
  await page.locator('#developer-lab').screenshot({ path: 'test-results/developer-lab.png' });
});

test('terminal runs every public command, handles history and clears output', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Terminal command', exact: true });
  const output = page.getByRole('log');
  const command = async (text: string) => { await input.fill(text); await input.press('Enter'); };
  await command('help');
  for (const name of ['help', 'whoami', 'skills', 'projects', 'contact', 'clear', 'date', 'game', 'github']) await expect(output).toContainText(name);
  await expect(output).not.toContainText('sudo hire amine');
  await command('whoami');
  await expect(output).toContainText('Amine Moutaki'); await expect(output).toContainText('Morocco');
  await command('skills'); await expect(output).toContainText('Docker, Git.');
  await command('projects');
  for (const name of ['01 — CarRent', '02 — ElectroShop', '03 — LinguaLearn']) await expect(output).toContainText(name);
  await command('contact'); await expect(output).toContainText('Contact details are not configured yet.');
  await expect(output).not.toContainText('@gmail.com');
  await command('date'); await expect(output).toContainText(String(new Date().getFullYear()));
  await command('github'); await expect(output).toContainText('GitHub URL is not configured yet.');
  await command('not-a-command'); await expect(output).toContainText("Command not found. Type 'help' for available commands.");
  await command('__proto__'); await expect(output).toContainText("Command not found. Type 'help' for available commands.");
  await input.fill('my draft'); await input.press('ArrowUp'); await expect(input).toHaveValue('__proto__');
  await input.press('ArrowUp'); await expect(input).toHaveValue('not-a-command');
  await input.press('ArrowDown'); await input.press('ArrowDown'); await expect(input).toHaveValue('my draft');
  await command('game'); await expect(page.getByRole('heading', { name: 'Catch the Bugs' })).toBeInViewport();
  await command('clear'); await expect(output).toBeEmpty();
  await command('whoami'); await page.getByRole('button', { name: 'Clear terminal', exact: true }).click();
  await expect(output).toBeEmpty(); await expect(input).toBeFocused();
});

test('secret commands animate locally, expire and provide a working contact action', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Terminal command', exact: true });
  await input.fill('sudo hire amine'); await input.press('Enter');
  await expect(page.getByRole('log')).toContainText('ACCESS GRANTED ✓');
  await expect(page.getByRole('log')).toContainText("Congratulations! You've discovered a secret command.");
  await expect(page.locator('.hire-particles')).toHaveCount(1);
  await page.clock.fastForward(1100); await expect(page.locator('.hire-particles')).toHaveCount(0);
  await page.getByRole('link', { name: 'CONTACT ME' }).click(); await expect(page).toHaveURL(/#contact$/);
  await input.fill('matrix'); await input.press('Enter');
  const effect = page.getByRole('status', { name: 'Matrix animation running' });
  await expect(effect).toBeVisible();
  const contained = await page.evaluate(() => {
    const outer = document.querySelector('.terminal-body')!.getBoundingClientRect();
    const inner = document.querySelector('.matrix-effect')!.getBoundingClientRect();
    return inner.left >= outer.left && inner.right <= outer.right && inner.top >= outer.top && inner.bottom <= outer.bottom;
  });
  expect(contained).toBe(true);
  await page.clock.fastForward(3300); await expect(effect).not.toBeVisible();
});

test('project previews support card clicks, keyboard focus, Escape and outside click', async ({ page }) => {
  await page.goto('/');
  for (const name of ['CarRent', 'ElectroShop', 'LinguaLearn']) {
    const card = page.getByRole('article', { name: `${name} project card` });
    await card.focus(); await card.press('Enter');
    const dialog = page.getByRole('dialog', { name });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close project details' })).toBeFocused();
    await expect(dialog.getByRole('heading', { name: '// KEY FEATURES' })).toBeVisible();
    if (name === 'CarRent') await dialog.screenshot({ path: 'test-results/carrent-preview.png' });
    await expect(dialog.getByRole('link')).toHaveCount(0);
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(true);
    await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(card).toBeFocused();
  }
  await page.getByRole('heading', { name: 'CarRent', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'CarRent' })).toBeVisible();
  await page.mouse.click(2, 2); await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('developer lab and project previews remain usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const panels = await page.locator('.lab-panel').evaluateAll(elements => elements.map(element => { const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y, bottom: rect.bottom, width: rect.width }; }));
  expect(panels[1].x).toEqual(panels[0].x); expect(panels[1].y).toBeGreaterThan(panels[0].bottom);
  const input = page.getByRole('textbox', { name: 'Terminal command', exact: true });
  await input.fill('whoami'); await page.getByRole('button', { name: 'Execute terminal command' }).click();
  await expect(page.getByRole('log')).toContainText('Amine Moutaki');
  await page.getByRole('button', { name: 'Explore LinguaLearn' }).click();
  await expect(page.getByRole('dialog', { name: 'LinguaLearn' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Close project details' }).click();
});

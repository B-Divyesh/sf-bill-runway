import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('plans an uncovered bill, persists it, and marks it paid', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/See the gap/);
  await page.getByRole('button', { name: 'Plan settings' }).click();
  await page.getByLabel('Money available now').fill('100.00');
  await page.getByRole('button', { name: 'Save settings' }).click();

  await page.getByRole('button', { name: 'Add bill', exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Add bill' });
  await dialog.getByLabel('Name', { exact: true }).fill('Electricity');
  await dialog.getByRole('textbox', { name: 'Amount', exact: true }).fill('125.50');
  await dialog.getByRole('button', { name: 'Add bill', exact: true }).click();

  await expect(page.getByText(/is uncovered by/)).toContainText('$25.50');
  await page.reload();
  await expect(page.getByText('Electricity').first()).toBeVisible();
  await page.getByRole('button', { name: 'Mark paid' }).click();
  await expect(page.getByText('All covered')).toBeVisible();
});

test('stays usable offline after an online visit', async ({ page, context }) => {
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await page.waitForFunction(async () => Boolean(await caches.open('bill-runway-v4').then(cache => cache.match('/index.html'))));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText(/Offline ·/)).toBeVisible();
  await context.setOffline(false);
});

test('rejects an imported backup with an impossible calendar date without replacing the plan', async ({ page }) => {
  await page.locator('#import-json').setInputFiles('tests/fixtures/impossible-date.json');
  await expect(page.getByRole('status')).toContainText('Import failed. Choose an unmodified Bill Runway JSON backup.');
  await expect(page.getByText('My runway')).toBeVisible();
  await expect(page.getByText('Impossible bill')).not.toBeVisible();
});

test('keeps the planner within a 390px viewport and exposes the keyboard skip link', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
});

test('has no automatically detectable serious accessibility issues', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact || '')), `${theme} theme`).toEqual([]);
  }
});

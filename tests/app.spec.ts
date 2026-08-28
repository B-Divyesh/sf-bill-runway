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
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText(/Offline ·/)).toBeVisible();
  await context.setOffline(false);
});

test('has no automatically detectable serious accessibility issues', async ({ page }) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
});

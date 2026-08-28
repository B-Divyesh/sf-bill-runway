import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title.includes('migrates stored')) return;
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
  await page.waitForFunction(async () => {
    const keys = await caches.keys();
    return (await Promise.all(keys.filter(key => key.startsWith('bill-runway-v')).map(key => caches.open(key).then(cache => cache.match('/index.html'))))).some(Boolean);
  });
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

test('migrates stored v1 data without normalising an impossible date', async ({ page }) => {
  await page.goto('/offline.html');
  await page.evaluate(async () => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('bill-runway', 1);
    request.onupgradeneeded = () => {
      const entries = request.result.createObjectStore('entries', { keyPath: 'id' });
      request.result.createObjectStore('settings', { keyPath: 'key' });
      const base = { kind: 'bill', amountCents: 100, recurrence: 'none', note: '', paidDates: [], createdAt: '', updatedAt: '' };
      entries.put({ ...base, id: 'bad', name: 'Impossible stored bill', firstDate: '2026-09-31' });
      entries.put({ ...base, id: 'good', name: 'Valid stored bill', firstDate: '2026-09-30' });
    };
    request.onsuccess = () => { request.result.close(); resolve(); };
    request.onerror = () => reject(request.error);
  }));
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Valid stored bill/ })).toBeVisible();
  await expect(page.getByText('Impossible stored bill')).not.toBeVisible();
  expect(await page.evaluate(async () => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('bill-runway');
    request.onsuccess = () => {
      const count = request.result.transaction('entries').objectStore('entries').count();
      count.onsuccess = () => { request.result.close(); resolve(count.result); };
      count.onerror = () => reject(count.error);
    };
    request.onerror = () => reject(request.error);
  }))).toBe(1);
});

test('imports a real leap date and exports owned data', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#import-json').setInputFiles('tests/fixtures/leap-date.json');
  await expect(page.getByRole('status')).toContainText('Backup imported.');
  await expect(page.getByRole('button', { name: /Leap bill/ })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Back up data' }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/^bill-runway-\d{4}-\d{2}-\d{2}\.json$/);
});

test('restores focus when an entry dialog closes with Escape', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'Add bill', exact: true }).first();
  await opener.click();
  await expect(page.getByRole('dialog', { name: 'Add bill' }).getByLabel('Name', { exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Add bill' })).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test('does not expose a dead checkout when the product is absent', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products', route => route.fulfill({ json: { data: [] } }));
  await page.getByRole('button', { name: /12 months/ }).click();
  await expect(page.getByText('Plus purchases are temporarily unavailable.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy Plus for $19' })).toBeHidden();
  await expect(page.getByLabel('License token')).toBeEnabled();
});

test('exposes the Sociobot checkout only for a registered catalogue product', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products', route => route.fulfill({ json: { data: [{ slug: 'bill-runway' }] } }));
  await page.getByRole('button', { name: 'See the Plus unlock' }).click();
  await expect(page.getByRole('link', { name: 'Buy Plus for $19' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/bill-runway/checkout');
});

test('captures a returned license, strips it from the URL, and unlocks after verification', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/bill-runway/verify?license=valid-token', route => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/?license=valid-token');
  await expect(page).not.toHaveURL(/license=/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sb_license:bill-runway'))).toBe('valid-token');
  await page.getByRole('button', { name: /12 months/ }).click();
  await expect(page.getByRole('heading', { name: 'The next 365 days' })).toBeVisible();
});

test('privacy and terms remain standalone and make no external requests', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main h1')).toHaveCount(1);
  }
  expect(external).toEqual([]);
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

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

declare global {
  interface Window { __openedDatabases?: string[]; }
}

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title.includes('migrates stored')) return;
  await page.goto('/');
});

test('@claim:first-gap identifies the first uncovered bill amount', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/See cash gaps/);
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
});

test('@claim:paid-status records a paid bill across reload and restores it with undo', async ({ page }) => {
  await page.getByRole('button', { name: 'Add bill', exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Add bill' });
  await dialog.getByLabel('Name', { exact: true }).fill('Internet');
  await dialog.getByRole('textbox', { name: 'Amount', exact: true }).fill('45.00');
  await dialog.getByRole('button', { name: 'Add bill', exact: true }).click();
  await page.getByRole('button', { name: 'Mark paid' }).click();
  await expect(page.getByRole('button', { name: 'Undo paid' })).toBeVisible();
  await page.reload();
  const undo = page.getByRole('button', { name: 'Undo paid' });
  await expect(undo).toBeVisible();
  await undo.click();
  await expect(page.getByRole('button', { name: 'Mark paid' })).toBeVisible();
});

test('@claim:offline-reload stays usable offline after an online visit', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/demo');
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
  await context.close();
});

test('rejects an imported backup with an impossible calendar date without replacing the plan', async ({ page }) => {
  await page.locator('#import-json').setInputFiles('tests/fixtures/impossible-date.json');
  await expect(page.getByRole('status')).toContainText('Import failed. Choose an unmodified Bill Runway JSON backup.');
  await expect(page.getByText('My plan')).toBeVisible();
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

test('@claim:json-backup imports a real leap date and exports owned data', async ({ page }) => {
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

test('@claim:twelve-month-view keeps the 12-month planner usable when no production checkout exists', async ({ page }) => {
  let billingRequests = 0;
  await page.route('https://api.sociobot.in/**', route => {
    billingRequests += 1;
    return route.fulfill({ status: 404, json: { error: 'enabled factory product', status: 404 } });
  });

  await expect(page.getByRole('heading', { name: 'The next 60 days' })).toBeVisible();
  await page.getByRole('button', { name: '12 months' }).click();

  await expect(page.getByRole('heading', { name: 'The next 365 days' })).toBeVisible();
  await expect(page.getByText(/temporarily unavailable/i)).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Buy Plus/i })).toHaveCount(0);
  expect(billingRequests).toBe(0);
});

test('discards a retired license token without transmitting it', async ({ page }) => {
  let billingRequests = 0;
  await page.route('https://api.sociobot.in/**', route => { billingRequests += 1; return route.abort(); });
  await page.goto('/?license=valid-token');
  await expect(page).not.toHaveURL(/license=/);
  expect(await page.evaluate(() => localStorage.getItem('sb_license:bill-runway'))).toBeNull();
  await page.getByRole('button', { name: /12 months/ }).click();
  await expect(page.getByRole('heading', { name: 'The next 365 days' })).toBeVisible();
  expect(billingRequests).toBe(0);
});

test('@claim:demo-isolation keeps sample changes separate from the real plan', async ({ page }) => {
  await page.getByRole('button', { name: 'Plan settings' }).click();
  await page.getByLabel('Plan name').fill('Private household plan');
  await page.getByRole('button', { name: 'Save settings' }).click();

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://bill-runway.sociobot.in/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved to your plan')).toBeVisible();
  await expect(page.getByText('Care plan sample')).toBeVisible();
  await expect(page.getByRole('button', { name: /Electricity/ })).toBeVisible();
  await expect(page.locator('.entry-edit')).toHaveCount(4);

  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.getByText('Private household plan')).toBeVisible();
  expect(await page.evaluate(async () => (await indexedDB.databases()).some(database => database.name === 'demo:bill-runway'))).toBe(false);
});

test('@claim:reset-demo restores the original sample without opening the real plan', async ({ page }) => {
  await page.getByRole('button', { name: 'Plan settings' }).click();
  await page.getByLabel('Plan name').fill('Private household plan');
  await page.getByRole('button', { name: 'Save settings' }).click();

  await page.addInitScript(() => {
    const opened: string[] = [];
    const open = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function(name: string, version?: number) {
      opened.push(String(name));
      return version === undefined ? open.call(this, name) : open.call(this, name, version);
    };
    Object.defineProperty(window, '__openedDatabases', { value: opened });
  });
  await page.goto('/demo');
  const electricity = page.locator('.timeline-event', { hasText: 'Electricity' }).first();
  await electricity.getByRole('button', { name: 'Mark paid' }).click();
  await expect(electricity.getByRole('button', { name: 'Undo paid' })).toBeVisible();

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#announcer')).toContainText('Demo reset to the original sample.');
  await expect(page.locator('.summary-strip strong').first()).toHaveText('$900.00');
  await expect(page.locator('.entry-edit')).toHaveCount(4);
  for (const name of ['Electricity', 'Rent', 'Caregiver deposit', 'Pharmacy']) {
    await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible();
  }
  await expect(page.locator('.timeline-event', { hasText: 'Electricity' }).first().getByRole('button', { name: 'Mark paid' })).toBeVisible();
  expect(await page.evaluate(() => window.__openedDatabases ?? [])).toEqual(expect.arrayContaining(['demo:bill-runway']));
  expect(await page.evaluate(() => (window.__openedDatabases ?? []).every(name => name === 'demo:bill-runway'))).toBe(true);

});

test('@claim:csv-export exports one CSV row per visible upcoming-list item', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeBlob = Blob;
    class CapturedBlob extends NativeBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        void this.text().then(text => sessionStorage.setItem('captured-download', text));
      }
    }
    Object.defineProperty(globalThis, 'Blob', { value: CapturedBlob });
  });
  await page.goto('/demo');
  const eventCount = await page.locator('.timeline-event').count();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export upcoming list as CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/^upcoming-list-\d{4}-\d{2}-\d{2}\.csv$/);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('captured-download'))).not.toBeNull();
  const csv = await page.evaluate(() => sessionStorage.getItem('captured-download')) as string;
  const rows = csv.trim().split('\n');
  expect(rows[0]).toBe('"Date","Type","Name","Amount","Status","Balance after"');
  expect(rows.slice(1).some(row => row.includes('"Electricity"'))).toBe(true);
  expect(rows).toHaveLength(eventCount + 1);
});

test('@claim:local-only sends no plan data off origin during a demo flow', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Mark paid' }).first().click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('button', { name: /Electricity/ })).toBeVisible();
  expect(external).toEqual([]);
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

test('keeps the sample action and populated demo plan in the first phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const sampleLink = page.getByRole('link', { name: 'Try it with sample data' });
  await expect(sampleLink).toBeVisible();
  expect((await sampleLink.boundingBox())!.y + (await sampleLink.boundingBox())!.height).toBeLessThanOrEqual(844);

  await sampleLink.click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved to your plan')).toBeVisible();
  const summary = page.locator('.summary-strip strong').first();
  await expect(summary).toHaveText('$900.00');
  const electricity = page.locator('.timeline-event').first();
  await expect(electricity).toContainText('Electricity');
  const gap = page.getByText(/is uncovered by/);
  for (const locator of [summary, electricity, gap]) {
    await expect(locator).toBeVisible();
    expect((await locator.boundingBox())!.y).toBeLessThan(844);
  }
});

test('keeps demo range controls and legal Terms links at least 44px at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const rangeTargets = await page.locator('[data-days]').evaluateAll(targets => targets.map(target => {
    const box = target.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }));
  expect(rangeTargets).toHaveLength(2);
  expect(rangeTargets.every(target => target.width >= 44 && target.height >= 44)).toBe(true);

  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    const termsTargets = await page.getByRole('link', { name: 'Terms', exact: true }).evaluateAll(targets => targets.map(target => {
      const box = target.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }));
    expect(termsTargets.length).toBeGreaterThan(0);
    expect(termsTargets.every(target => target.width >= 44 && target.height >= 44)).toBe(true);
  }
});

test('uses the common legal skeleton and moves focus to the new route heading', async ({ page }) => {
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page).toHaveURL(/\/privacy\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Terms' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: 'Privacy' })).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card/);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('ships the common navigation and legal footer on the static 404 page', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Bill Runway');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Demo' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: 'Privacy' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Bill Runway' })).toBeVisible();
});

test('opens the isolated sample directly with the demo query path', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved to your plan')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Review a sample plan.' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('demo:bill-runway:seeded'))).toBe('1');
  expect(await page.evaluate(async () => (await indexedDB.databases()).some(database => database.name === 'demo:bill-runway'))).toBe(true);
});

test('@claim:keyboard-controls preserves focus through planner changes and keeps mobile controls clear', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const twelveMonths = page.getByRole('button', { name: '12 months' });
  await twelveMonths.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'The next 365 days' })).toBeVisible();
  await expect(twelveMonths).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Print upcoming list' })).toBeFocused();

  await page.goto('/demo');
  const paidToggle = page.getByRole('button', { name: 'Mark paid' }).first();
  await paidToggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Undo paid' }).first()).toBeFocused();

  const resetDemo = page.getByRole('button', { name: 'Reset demo' });
  await resetDemo.focus();
  await page.keyboard.press('Space');
  await expect(resetDemo).toBeFocused();

  await page.goto('/');
  await page.getByRole('button', { name: 'Plan settings' }).click();
  const saveSettings = page.getByRole('button', { name: 'Save settings' });
  await saveSettings.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Plan settings' })).toBeFocused();

  await page.goto('/');

  // Reach the real file control through the keyboard, rather than focusing it
  // programmatically: the visually-hidden input is the element that receives
  // focus and its visible label must mirror that state.
  for (let tab = 0; tab < 30; tab += 1) {
    if (await page.locator('#import-json').evaluate(input => input === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(page.locator('#import-json')).toBeFocused();
  await expect(page.locator('.file-button')).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('.file-button')).toHaveCSS('outline-width', '3px');

  const gaps = await page.evaluate(() => {
    const horizontalGap = (first: string, second: string) => {
      const a = document.querySelector(first)?.getBoundingClientRect();
      const b = document.querySelector(second)?.getBoundingClientRect();
      if (!a || !b) throw new Error(`Missing mobile controls: ${first}, ${second}`);
      return b.left - a.right;
    };
    return {
      printExport: horizontalGap('#print-run', '#export-csv'),
      backupImport: horizontalGap('#export-json', '.file-button')
    };
  });
  expect(gaps.printExport).toBeGreaterThanOrEqual(8);
  expect(gaps.backupImport).toBeGreaterThanOrEqual(8);
});

test('@claim:print-layout prints the sample 60-day upcoming list on one A4 page', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.timeline-event')).toHaveCount(7);
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('heading', { name: 'Upcoming bills and income' })).toBeVisible();
  await expect(page.locator('.timeline-event').first()).toBeVisible();
  await expect(page.locator('.hero')).toBeHidden();
  await expect(page.locator('.waypoints')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Mark paid' }).first()).toBeHidden();
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  const pageObjects = pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? [];
  expect(pageObjects).toHaveLength(1);
});

test('loads both demo URL forms without path-relative asset requests or browser errors', async ({ browser }) => {
  for (const path of ['/demo', '/demo/']) {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const page = await context.newPage();
    const badResponses: string[] = [];
    const failedRequests: string[] = [];
    const consoleErrors: string[] = [];
    const requestedPaths: string[] = [];
    page.on('request', request => requestedPaths.push(new URL(request.url()).pathname));
    page.on('requestfailed', request => failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`));
    page.on('response', response => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });

    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Review a sample plan.' })).toBeVisible();
    await expect(page.locator('link[rel="preload"]')).toHaveAttribute('href', '/art/runway-hero-1200.webp');
    await expect(page.locator('link[rel="preload"]')).toHaveAttribute('imagesrcset', '/art/runway-hero-720.webp 720w, /art/runway-hero-1200.webp 1200w');
    expect(requestedPaths.filter(requestPath => requestPath.startsWith('/demo/art/'))).toEqual([]);
    expect(badResponses).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(consoleErrors).toEqual([]);
    await context.close();
  }
});

test('has no automatically detectable serious accessibility issues', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(path);
    const themes = path === '/' || path === '/demo' ? ['light', 'dark'] : ['default'];
    for (const theme of themes) {
      if (theme !== 'default') await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      await page.waitForTimeout(300);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact || '')), `${path} ${theme}`).toEqual([]);
    }
  }
});

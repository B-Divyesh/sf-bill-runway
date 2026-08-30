import './styles.css';
import { configureStorageNamespace, deleteDemoData, deleteEntry, loadData, replaceData, saveEntry, saveSettings } from './db';
import { isValidAppData } from './data-validation';
import { addDays, buildRunway, formatMoney, fromISO, isValidISODate, parseMoney, todayISO } from './money';
import type { AppData, Entry, EntryKind, Occurrence, Recurrence, Settings } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const DEMO_SEEDED_KEY = 'demo:bill-runway:seeded';
const BUILD_ID = 'repair-5';

let data: AppData;
let days = 60;
let isDemo = false;
let online = navigator.onLine;
let installPrompt: BeforeInstallPromptEvent | null = null;
let editingId: string | null = null;
let dialogKind: EntryKind = 'bill';
let entryFocusSelector = '[data-open="bill"]';

interface BeforeInstallPromptEvent extends Event { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }>; }

const esc = (value: string) => value.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]!));
const dateLabel = (iso: string) => new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(fromISO(iso));
const recurrenceLabel = (r: Recurrence) => ({ none: 'One time', weekly: 'Every week', monthly: 'Every month', yearly: 'Every year' }[r]);

function announce(message: string) {
  const region = document.querySelector<HTMLElement>('#announcer');
  if (region) {
    region.textContent = message;
    region.classList.add('show');
    window.setTimeout(() => region.classList.remove('show'), 4200);
  }
}

function setPageMetadata(title: string, description: string, canonical: string, noindex = false) {
  document.title = title;
  const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonicalLink) canonicalLink.href = canonical;
  const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.content = description;
  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
  const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
  const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
  const twitterTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
  if (ogTitle) ogTitle.content = title;
  if (ogDescription) ogDescription.content = description;
  if (ogUrl) ogUrl.content = canonical;
  if (twitterTitle) twitterTitle.content = title;
  if (twitterDescription) twitterDescription.content = description;
  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (noindex && !robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.append(robots); }
  if (robots) robots.content = noindex ? 'noindex, nofollow' : 'index, follow';
}

function focusRouteHeading() {
  window.setTimeout(() => document.querySelector<HTMLElement>('main h1')?.focus(), 0);
}

function button(label: string, cls = 'button secondary', attrs = '') {
  return `<button class="${cls}" ${attrs}>${label}</button>`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  return `<header class="site-header"><a class="brand" href="/" aria-label="Bill Runway home"><span class="brand-mark" aria-hidden="true"></span>Bill Runway</a><nav aria-label="Primary"><a href="/demo">Demo</a><a href="/privacy" ${privacy ? 'aria-current="page"' : ''}>Privacy</a><a href="/terms" ${privacy ? '' : 'aria-current="page"'}>Terms</a></nav></header>
  <main id="main" class="legal"><p class="eyebrow">Plain-language ${privacy ? 'privacy' : 'terms'}</p><h1 tabindex="-1">${privacy ? 'Your plan stays yours.' : 'A planning tool, not advice.'}</h1>
  ${privacy ? `<p>Bill Runway stores bills, income dates, notes, settings, and paid status in IndexedDB on this device. We do not receive or analyse your plan. The app has no analytics, ad trackers, bank connections, or third-party scripts.</p><h2>Demo data</h2><p>The demo uses a separate browser database. Resetting or leaving through “Start for real” deletes that sample workspace without reading your real plan.</p><h2>Your choices</h2><p>Use “Back up data” to take a JSON copy. Clearing site data removes the local plan from this browser. Import only backups you trust.</p>` : `<p>Bill Runway displays forecasts from dates, amounts, and starting money that you enter. It does not connect to financial institutions or move money. It does not guarantee income or provide financial, debt, tax, or legal advice. Check each invoice and account before paying.</p><h2>Price</h2><p>The complete planner, including its 12-month view, is free. There is no checkout, account, or subscription.</p><h2>Warranty</h2><p>The software is provided “as is” without warranty. You remain responsible for entered data, backups, and payment decisions. These terms are governed by applicable law and do not limit rights that cannot legally be limited.</p>`}
  <p class="legal-date">Effective 30 August 2026 · <a href="/">Return to Bill Runway</a></p></main>${footer()}`;
}

function footer() {
  return `<footer><p>Plan bills against expected income on this device.</p><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><p class="art-credit">Built by Param Factory · ${BUILD_ID}</p></footer>`;
}

function renderEntryDialog(): string {
  const entry = editingId ? data.entries.find(item => item.id === editingId) : undefined;
  const kind = entry?.kind ?? dialogKind;
  return `<dialog id="entry-dialog" aria-labelledby="dialog-title"><form id="entry-form" method="dialog" novalidate>
    <div class="dialog-heading"><div><p class="eyebrow">${entry ? 'Update entry' : 'New entry'}</p><h2 id="dialog-title">${entry ? 'Edit' : 'Add'} ${kind}</h2></div><button class="icon-button close-dialog" type="button" aria-label="Close dialog">×</button></div>
    <input type="hidden" name="kind" value="${kind}">
    <label>Name <input name="name" required maxlength="60" value="${esc(entry?.name ?? '')}" autocomplete="off"></label>
    <div class="field-row"><label>Amount <span class="input-prefix"><span aria-hidden="true">${currencySymbol(data.settings.currency)}</span><input name="amount" inputmode="decimal" required value="${entry ? (entry.amountCents / 100).toFixed(2) : ''}"></span></label><label>${kind === 'bill' ? 'Due' : 'Expected'} date <input name="date" type="date" required value="${entry?.firstDate ?? todayISO()}"></label></div>
    <label>Repeat <select name="recurrence"><option value="none">One time</option><option value="weekly" ${entry?.recurrence === 'weekly' ? 'selected' : ''}>Every week</option><option value="monthly" ${entry?.recurrence === 'monthly' ? 'selected' : ''}>Every month</option><option value="yearly" ${entry?.recurrence === 'yearly' ? 'selected' : ''}>Every year</option></select></label>
    <label>Note <span class="optional">Optional</span><textarea name="note" maxlength="160" rows="2">${esc(entry?.note ?? '')}</textarea></label>
    <p id="form-error" class="form-error" role="alert"></p>
    <div class="dialog-actions">${entry ? button('Delete', 'button danger', 'type="button" id="delete-entry"') : ''}<span class="spacer"></span>${button('Cancel', 'button ghost close-dialog', 'type="button"')}${button(entry ? 'Save changes' : `Add ${kind}`, 'button primary', 'type="submit"')}</div>
  </form></dialog>`;
}

function currencySymbol(currency: string) {
  return { USD: '$', GBP: '£', EUR: '€', INR: '₹', CAD: 'C$', AUD: 'A$' }[currency] ?? '$';
}

function sampleData(): AppData {
  const now = new Date().toISOString();
  const sampleEntry = (id: string, kind: EntryKind, name: string, amountCents: number, offset: number, recurrence: Recurrence, note: string): Entry => ({
    id, kind, name, amountCents, firstDate: addDays(todayISO(), offset), recurrence, note, paidDates: [], createdAt: now, updatedAt: now
  });
  return {
    version: 1,
    settings: { balanceCents: 90000, currency: 'USD', planName: 'Care plan sample', updatedAt: now },
    entries: [
      sampleEntry('demo-electricity', 'bill', 'Electricity', 14680, 3, 'monthly', 'Average statement'),
      sampleEntry('demo-rent', 'bill', 'Rent', 120000, 8, 'monthly', 'Due before deposit'),
      sampleEntry('demo-income', 'income', 'Caregiver deposit', 90000, 10, 'monthly', 'Expected income'),
      sampleEntry('demo-pharmacy', 'bill', 'Pharmacy', 6425, 12, 'none', 'Prescription pickup')
    ]
  };
}

function renderSettingsDialog(): string {
  const s = data.settings;
  return `<dialog id="settings-dialog" aria-labelledby="settings-title"><form id="settings-form" method="dialog" novalidate>
  <div class="dialog-heading"><div><p class="eyebrow">Starting point</p><h2 id="settings-title">Plan settings</h2></div><button class="icon-button close-settings" type="button" aria-label="Close dialog">×</button></div>
  <label>Plan name <input name="planName" maxlength="40" required value="${esc(s.planName)}"></label>
  <div class="field-row"><label>Money available now <input name="balance" inputmode="decimal" required value="${(s.balanceCents / 100).toFixed(2)}"></label><label>Currency <select name="currency">${['USD', 'GBP', 'EUR', 'INR', 'CAD', 'AUD'].map(c => `<option ${c === s.currency ? 'selected' : ''}>${c}</option>`).join('')}</select></label></div>
  <p class="field-help">Use money that can actually pay these bills today. Update it after payments or deposits clear.</p><p id="settings-error" class="form-error" role="alert"></p>
  <div class="dialog-actions">${button('Cancel', 'button ghost close-settings', 'type="button"')}${button('Save settings', 'button primary', 'type="submit"')}</div></form></dialog>`;
}

function entryList(kind: EntryKind): string {
  const entries = data.entries.filter(e => e.kind === kind).sort((a, b) => a.firstDate.localeCompare(b.firstDate));
  if (!entries.length) return `<p class="mini-empty">No ${kind === 'bill' ? 'bills' : 'income'} added yet.</p>`;
  return `<ul class="entry-list">${entries.map(e => `<li><button class="entry-edit" data-edit="${e.id}"><span><strong>${esc(e.name)}</strong><small>${dateLabel(e.firstDate)} · ${recurrenceLabel(e.recurrence)}</small></span><b>${kind === 'income' ? '+' : '−'}${formatMoney(e.amountCents, data.settings.currency)}</b><span class="sr-only">Edit ${esc(e.name)}</span></button></li>`).join('')}</ul>`;
}

function timeline(occurrences: Occurrence[]): string {
  if (!occurrences.length) return `<section class="empty-timeline"><h2>No bills or income in this range.</h2><p>Add a bill or expected income to start the payment run.</p>${button('Add your first bill', 'button primary', 'data-open="bill"')}</section>`;
  let lastDate = '';
  return `<ol class="timeline-list">${occurrences.map(o => {
    const date = o.date === lastDate ? '' : `<time datetime="${o.date}">${dateLabel(o.date)}${o.date === todayISO() ? ' · Today' : ''}</time>`;
    lastDate = o.date;
    const isBill = o.entry.kind === 'bill';
    const status = o.paid ? 'Paid' : o.uncovered ? `Short ${formatMoney(o.uncovered, data.settings.currency)}` : 'Covered';
    return `<li class="timeline-event ${isBill ? 'bill' : 'income'} ${o.paid ? 'paid' : ''} ${o.uncovered ? 'uncovered' : ''}">${date}<div class="route-dot" aria-hidden="true"></div><div class="event-main"><div><p><strong>${esc(o.entry.name)}</strong> <span class="event-kind">${isBill ? 'Bill' : 'Income'}</span></p><p class="event-meta">${recurrenceLabel(o.entry.recurrence)}${o.entry.note ? ` · ${esc(o.entry.note)}` : ''}</p></div><p class="event-amount">${isBill ? '−' : '+'}${formatMoney(o.entry.amountCents, data.settings.currency)}</p><p class="event-balance"><span>${status}</span><small>${formatMoney(o.balanceAfter, data.settings.currency)} after</small></p>${isBill ? `<button class="paid-toggle" data-paid="${o.entry.id}" data-date="${o.date}" aria-pressed="${o.paid}">${o.paid ? 'Undo paid' : 'Mark paid'}</button>` : ''}</div></li>`;
  }).join('')}</ol>`;
}

function renderPlanner() {
  const occurrences = buildRunway(data.entries, data.settings.balanceCents, todayISO(), days);
  const lowest = occurrences.reduce((min, o) => Math.min(min, o.balanceAfter), data.settings.balanceCents);
  const firstGap = occurrences.find(o => o.uncovered > 0);
  const dueTotal = occurrences.filter(o => o.entry.kind === 'bill' && !o.paid).reduce((sum, o) => sum + o.entry.amountCents, 0);
  app.innerHTML = `<div id="announcer" class="toast" role="status" aria-live="polite"></div>
  <div id="offline-bar" class="offline-bar" ${online ? 'hidden' : ''}>Offline · your plan still works on this device</div>
  ${isDemo ? `<aside class="demo-banner" aria-label="Demo workspace"><strong>Demo — sample data, nothing is saved to your plan</strong><div>${button('Reset demo', 'button ghost', 'id="reset-demo"')}${button('Start for real', 'button ink', 'id="start-real"')}</div></aside>` : ''}
  <header class="site-header"><a class="brand" href="/" aria-label="Bill Runway home"><span class="brand-mark" aria-hidden="true"></span>Bill Runway</a><div class="header-actions"><nav aria-label="Primary"><a href="/demo" ${isDemo ? 'aria-current="page"' : ''}>Demo</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><div class="app-controls">${button('Install', 'button ghost install-button', installPrompt ? '' : 'hidden')} ${button('◐', 'icon-button', 'id="theme-toggle" aria-label="Switch color theme"')} ${button('Plan settings', 'button secondary', 'id="open-settings"')}</div></div></header>
  <main id="main" class="${isDemo ? 'demo-main' : ''}">
    ${isDemo ? `<section class="demo-heading"><p class="eyebrow">Sample workspace</p><h1 tabindex="-1">Review a sample plan.</h1><p>This sample shows $900.00, named bills, and the first shortfall.</p></section>` : `<section class="hero"><div class="hero-copy"><p class="eyebrow">A due-date cash planner</p><h1 tabindex="-1">See cash gaps<br>before bills are due.</h1><p class="lede">For people and caregivers who need to compare upcoming bills with expected income.</p><div class="hero-actions">${button('Add bill', 'button primary', 'data-open="bill"')}${button('Add income', 'button secondary', 'data-open="income"')}<a class="button ghost" href="/demo">Try it with sample data</a></div><p class="demo-intro">The sample opens a separate workspace with four realistic entries.</p><ul class="hero-facts"><li>Free, with a full 12-month view.</li><li>Plan data stays on this device.</li><li>Works offline after the first visit.</li></ul><p class="advice-note">Forecast from your entries—not financial advice.</p></div><picture class="hero-art"><source media="(max-width: 620px)" srcset="/art/runway-hero-720.webp"><img src="/art/runway-hero-1200.webp" width="1200" height="800" alt="A coral paper causeway crosses dark-blue tidal flats toward an amber sun" fetchpriority="high" decoding="async"></picture></section>`}
    <section class="runway-shell" aria-labelledby="runway-title"><div class="section-heading"><div><p class="eyebrow">${esc(data.settings.planName)}</p><h2 id="runway-title">The next ${days} days</h2></div><div class="range-switch" aria-label="Forecast range"><button class="${days === 60 ? 'active' : ''}" data-days="60" aria-pressed="${days === 60}">60 days</button><button class="${days === 365 ? 'active' : ''}" data-days="365" aria-pressed="${days === 365}">12 months</button></div></div>
    <div class="summary-strip"><div><span>Available now</span><strong>${formatMoney(data.settings.balanceCents, data.settings.currency)}</strong></div><div><span>Bills in range</span><strong>${formatMoney(dueTotal, data.settings.currency)}</strong></div><div class="${lowest < 0 ? 'negative' : ''}"><span>Lowest point</span><strong>${formatMoney(lowest, data.settings.currency)}</strong></div><div class="coverage"><span>Coverage</span><strong>${firstGap ? `Gap on ${dateLabel(firstGap.date)}` : 'All covered'}</strong></div></div>
    ${firstGap ? `<div class="gap-callout" role="status"><span class="gap-icon" aria-hidden="true">!</span><p><strong>${formatMoney(firstGap.uncovered, data.settings.currency)} is uncovered by ${dateLabel(firstGap.date)}.</strong><br>That is the first point where entered bills exceed available money and expected income.</p></div>` : occurrences.length ? `<div class="clear-callout" role="status"><span aria-hidden="true">✓</span><p><strong>All bills are covered.</strong> Your entered money and income cover every bill in this range.</p></div>` : ''}
    <div class="runway-grid"><section class="timeline" aria-labelledby="timeline-title"><div class="subheading"><h3 id="timeline-title">Payment run</h3><div>${button('Print payment run', 'button ghost', 'id="print-run"')}${button('Export CSV', 'button ghost', 'id="export-csv"')}</div></div>${timeline(occurrences)}</section>
    <aside class="waypoints" aria-label="Plan entries"><section><div class="subheading"><h3>Bills</h3>${button('+ Add', 'button text-button', 'data-open="bill"')}</div>${entryList('bill')}</section><section><div class="subheading"><h3>Expected income</h3>${button('+ Add', 'button text-button', 'data-open="income"')}</div>${entryList('income')}</section><section class="data-tools"><h3>Your data</h3><p>Stored only in this browser.</p><div>${button('Back up data', 'button ghost', 'id="export-json"')}<label class="button ghost file-button">Import backup<input id="import-json" type="file" accept="application/json"></label></div></section></aside></div></section>
    ${isDemo ? '' : '<section class="info-sections" aria-label="About Bill Runway"><div><p class="eyebrow">How it works</p><h2>Turn due dates into a payment run.</h2><ol><li><strong>Add what is available.</strong><span>Set the money you can use today.</span></li><li><strong>Add bills and income.</strong><span>Choose dates and repeat rules.</span></li><li><strong>Check the first gap.</strong><span>Print or export the payment run.</span></li></ol></div><div class="limits"><p class="eyebrow">What it does not do</p><h2>No bank connections or payments.</h2><p>Bill Runway does not connect to banks or move money. It uses only the planning details you enter.</p><a href="/privacy">Read the privacy notice</a></div></section>'}
  </main>${footer()}${renderEntryDialog()}${renderSettingsDialog()}`;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach(el => el.addEventListener('click', () => openEntry(el.dataset.open as EntryKind)));
  document.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(el => el.addEventListener('click', () => openEntry(data.entries.find(e => e.id === el.dataset.edit)!.kind, el.dataset.edit)));
  const entryDialog = document.querySelector<HTMLDialogElement>('#entry-dialog');
  document.querySelectorAll<HTMLButtonElement>('.close-dialog').forEach(el => el.addEventListener('click', () => entryDialog?.close()));
  entryDialog?.addEventListener('close', () => document.querySelector<HTMLElement>(entryFocusSelector)?.focus());
  document.querySelectorAll<HTMLButtonElement>('.close-settings').forEach(el => el.addEventListener('click', () => (document.querySelector('#settings-dialog') as HTMLDialogElement).close()));
  document.querySelector('#entry-form')?.addEventListener('submit', submitEntry);
  document.querySelector('#settings-form')?.addEventListener('submit', submitSettings);
  document.querySelector('#delete-entry')?.addEventListener('click', removeCurrentEntry);
  document.querySelector('#open-settings')?.addEventListener('click', () => (document.querySelector('#settings-dialog') as HTMLDialogElement).showModal());
  document.querySelectorAll<HTMLButtonElement>('[data-days]').forEach(el => el.addEventListener('click', () => changeDays(Number(el.dataset.days))));
  document.querySelectorAll<HTMLButtonElement>('[data-paid]').forEach(el => el.addEventListener('click', () => togglePaid(el.dataset.paid!, el.dataset.date!)));
  document.querySelector('#print-run')?.addEventListener('click', () => window.print());
  document.querySelector('#export-csv')?.addEventListener('click', exportCSV);
  document.querySelector('#export-json')?.addEventListener('click', exportJSON);
  document.querySelector('#import-json')?.addEventListener('change', importJSON);
  document.querySelector('#theme-toggle')?.addEventListener('click', toggleTheme);
  document.querySelector('.install-button')?.addEventListener('click', installApp);
  document.querySelector('#reset-demo')?.addEventListener('click', resetDemo);
  document.querySelector('#start-real')?.addEventListener('click', startForReal);
  document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
}

function openEntry(kind: EntryKind, id: string | null = null) {
  dialogKind = kind; editingId = id;
  entryFocusSelector = id ? `[data-edit="${CSS.escape(id)}"]` : `[data-open="${kind}"]`;
  renderPlanner();
  (document.querySelector('#entry-dialog') as HTMLDialogElement).showModal();
  setTimeout(() => document.querySelector<HTMLInputElement>('#entry-form input[name="name"]')?.focus(), 0);
}

async function submitEntry(event: Event) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const fd = new FormData(form);
  const error = form.querySelector<HTMLElement>('#form-error')!;
  const amount = parseMoney(String(fd.get('amount')));
  const name = String(fd.get('name')).trim();
  const firstDate = String(fd.get('date'));
  if (!name) { error.textContent = 'Enter a name for this bill or income.'; return; }
  if (amount === null || amount <= 0) { error.textContent = 'Enter a positive amount with no more than two decimal places.'; return; }
  if (!isValidISODate(firstDate)) { error.textContent = 'Choose a valid calendar date.'; return; }
  const old = editingId ? data.entries.find(e => e.id === editingId) : undefined;
  const now = new Date().toISOString();
  const entry: Entry = { id: old?.id ?? crypto.randomUUID(), kind: String(fd.get('kind')) as EntryKind, name, amountCents: amount, firstDate, recurrence: String(fd.get('recurrence')) as Recurrence, note: String(fd.get('note')).trim(), paidDates: old?.paidDates ?? [], createdAt: old?.createdAt ?? now, updatedAt: now };
  await saveEntry(entry);
  data.entries = old ? data.entries.map(e => e.id === entry.id ? entry : e) : [...data.entries, entry];
  renderPlanner(); document.querySelector<HTMLElement>(`[data-edit="${CSS.escape(entry.id)}"]`)?.focus(); announce(`${entry.kind === 'bill' ? 'Bill' : 'Income'} ${entry.name} saved.`);
}

async function removeCurrentEntry() {
  const entry = data.entries.find(e => e.id === editingId);
  if (!entry || !confirm(`Delete “${entry.name}” and all of its future occurrences?`)) return;
  await deleteEntry(entry.id); data.entries = data.entries.filter(e => e.id !== entry.id); renderPlanner(); announce(`${entry.name} deleted.`);
}

async function submitSettings(event: Event) {
  event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const fd = new FormData(form); const balance = parseMoney(String(fd.get('balance'))); const error = form.querySelector<HTMLElement>('#settings-error')!;
  if (balance === null) { error.textContent = 'Enter money available with no more than two decimal places.'; return; }
  const planName = String(fd.get('planName')).trim(); if (!planName) { error.textContent = 'Give this plan a short name.'; return; }
  const settings: Settings = { balanceCents: balance, currency: String(fd.get('currency')) as Settings['currency'], planName, updatedAt: new Date().toISOString() };
  await saveSettings(settings); data.settings = settings; renderPlanner(); announce('Plan settings saved.');
}

async function togglePaid(id: string, date: string) {
  const entry = data.entries.find(e => e.id === id)!; const paid = entry.paidDates.includes(date);
  entry.paidDates = paid ? entry.paidDates.filter(d => d !== date) : [...entry.paidDates, date]; entry.updatedAt = new Date().toISOString();
  await saveEntry(entry); renderPlanner(); announce(`${entry.name} marked ${paid ? 'unpaid' : 'paid'}. Update money available if your balance has changed.`);
}

function changeDays(next: number) {
  days = next; renderPlanner();
}

function download(name: string, type: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

function exportJSON() { download(`bill-runway-${todayISO()}.json`, 'application/json', JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)); announce('Backup downloaded.'); }
function exportCSV() {
  const rows = [['Date', 'Type', 'Name', 'Amount', 'Status', 'Balance after']];
  buildRunway(data.entries, data.settings.balanceCents, todayISO(), days).forEach(o => rows.push([o.date, o.entry.kind, o.entry.name, (o.entry.amountCents / 100).toFixed(2), o.paid ? 'Paid' : o.uncovered ? 'Uncovered' : 'Covered', (o.balanceAfter / 100).toFixed(2)]));
  download(`payment-run-${todayISO()}.csv`, 'text/csv', rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')); announce('Payment run CSV downloaded.');
}

async function importJSON(event: Event) {
  const input = event.currentTarget as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!isValidAppData(parsed)) throw new Error('shape');
    if (!confirm(`Replace this plan with ${parsed.entries.length} imported entries? A backup first is recommended.`)) return;
    await replaceData(parsed); data = await loadData(); renderPlanner(); announce('Backup imported.');
  } catch { announce('Import failed. Choose an unmodified Bill Runway JSON backup.'); }
  finally { input.value = ''; }
}

function toggleTheme() {
  const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'light' : 'dark'; localStorage.setItem('bill-runway-theme', dark ? 'light' : 'dark');
}

async function resetDemo() {
  data = sampleData();
  await replaceData(data);
  localStorage.setItem(DEMO_SEEDED_KEY, '1');
  days = 60;
  renderPlanner();
  announce('Demo reset to the original sample.');
}

async function startForReal() {
  localStorage.removeItem(DEMO_SEEDED_KEY);
  try { await deleteDemoData(); } catch { /* Navigation still leaves real data untouched. */ }
  location.assign('/');
}

async function installApp() { if (installPrompt) { await installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; renderPlanner(); } }

async function init() {
  const returnedWithHistory = performance.getEntriesByType('navigation').some(entry => (entry as PerformanceNavigationTiming).type === 'back_forward');
  const theme = localStorage.getItem('bill-runway-theme'); if (theme) document.documentElement.dataset.theme = theme;
  if (location.pathname === '/privacy' || location.pathname === '/privacy/') { setPageMetadata('Privacy — Bill Runway', 'How Bill Runway stores your plan and keeps the demo separate.', 'https://bill-runway.sociobot.in/privacy'); app.innerHTML = legalPage('privacy'); focusRouteHeading(); return; }
  if (location.pathname === '/terms' || location.pathname === '/terms/') { setPageMetadata('Terms — Bill Runway', 'Terms for using Bill Runway as a free planning tool.', 'https://bill-runway.sociobot.in/terms'); app.innerHTML = legalPage('terms'); focusRouteHeading(); return; }
  if (!['/', '/demo', '/demo/'].includes(location.pathname)) { setPageMetadata('Page not found — Bill Runway', 'The requested Bill Runway page was not found.', 'https://bill-runway.sociobot.in/404', true); app.innerHTML = `<header class="site-header"><a class="brand" href="/" aria-label="Bill Runway home"><span class="brand-mark" aria-hidden="true"></span>Bill Runway</a><nav aria-label="Primary"><a href="/demo">Demo</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></header><main id="main" class="fatal"><p class="eyebrow">404</p><h1 tabindex="-1">We could not find this page.</h1><p>The address may be wrong. Check the link and open Bill Runway again.</p><a class="button primary" href="/">Open Bill Runway</a></main>${footer()}`; focusRouteHeading(); return; }
  const url = new URL(location.href);
  // Retired checkout links may still return an old license parameter. Strip it
  // without storing or transmitting the token now that every feature is free.
  if (url.searchParams.has('license')) {
    url.searchParams.delete('license');
    history.replaceState({}, '', url);
  }
  localStorage.removeItem('sb_license:bill-runway');
  localStorage.removeItem('sb_license_verdict:bill-runway');
  isDemo = location.pathname === '/demo' || location.pathname === '/demo/' || url.searchParams.get('demo') === '1';
  configureStorageNamespace(isDemo);
  setPageMetadata(
    isDemo ? 'Demo — Bill Runway' : 'Bill Runway — see cash gaps before bills are due',
    isDemo ? 'Review a sample payment run with bills, income, and the first cash gap.' : 'Compare upcoming bills with expected income and find the first cash gap.',
    isDemo ? 'https://bill-runway.sociobot.in/demo' : 'https://bill-runway.sociobot.in/'
  );
  try {
    data = await loadData();
    if (isDemo && localStorage.getItem(DEMO_SEEDED_KEY) !== '1') {
      data = sampleData();
      await replaceData(data);
      localStorage.setItem(DEMO_SEEDED_KEY, '1');
    }
    renderPlanner();
    if (returnedWithHistory) focusRouteHeading();
  } catch { app.innerHTML = `<main id="main" class="fatal"><h1>Bill Runway could not open local storage.</h1><p>Allow site data for this browser, then reload. Nothing has been sent anywhere.</p><button class="button primary" onclick="location.reload()">Try again</button></main>`; }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then(reg => { reg.addEventListener('updatefound', () => { const worker = reg.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) announce('An update is ready. Reload to use it.'); }); }); }).catch(() => {});
}

window.addEventListener('online', () => { online = true; document.querySelector('#offline-bar')?.setAttribute('hidden', ''); announce('Back online.'); });
window.addEventListener('offline', () => { online = false; document.querySelector('#offline-bar')?.removeAttribute('hidden'); announce('You are offline. Your saved plan still works.'); });
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event as BeforeInstallPromptEvent; if (data) renderPlanner(); });

void init();

window.addEventListener('pageshow', event => {
  if (event.persisted || performance.getEntriesByType('navigation').some(entry => (entry as PerformanceNavigationTiming).type === 'back_forward')) focusRouteHeading();
});

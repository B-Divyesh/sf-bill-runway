import './styles.css';
import { deleteEntry, loadData, replaceData, saveEntry, saveSettings } from './db';
import { addDays, buildRunway, formatMoney, fromISO, parseMoney, todayISO } from './money';
import type { AppData, Entry, EntryKind, Occurrence, Recurrence, Settings } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const BILLING_BASE = import.meta.env.VITE_BILLING_BASE || 'https://api.sociobot.in/api/v1';
const LICENSE_KEY = 'sb_license:bill-runway';
const VERDICT_KEY = 'sb_license_verdict:bill-runway';

let data: AppData;
let days = 60;
let isPlus = false;
let online = navigator.onLine;
let installPrompt: BeforeInstallPromptEvent | null = null;
let editingId: string | null = null;
let dialogKind: EntryKind = 'bill';

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

function button(label: string, cls = 'button secondary', attrs = '') {
  return `<button class="${cls}" ${attrs}>${label}</button>`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  return `<header class="site-header"><a class="brand" href="/" aria-label="Bill Runway home"><span class="brand-mark" aria-hidden="true"></span>Bill Runway</a></header>
  <main id="main" class="legal"><p class="eyebrow">Plain-language ${privacy ? 'privacy' : 'terms'}</p><h1>${privacy ? 'Your plan stays yours.' : 'A planning tool, not advice.'}</h1>
  ${privacy ? `<p>Bill Runway stores bills, income dates, notes, settings, and paid status in IndexedDB on this device. We do not receive or analyse your plan, and there are no analytics, ad trackers, bank connections, or third-party scripts.</p><h2>Licenses</h2><p>If you buy or verify Plus, your browser contacts Sociobot’s billing API with the license token. The token and last verification result are stored locally. Checkout is hosted by Sociobot/Dodo, the merchant of record; this app never sees payment-card details.</p><h2>Your choices</h2><p>Use “Back up data” to take a JSON copy. Clearing site data removes the local plan and license from this browser. Import only backups you trust.</p>` : `<p>Bill Runway displays forecasts from dates, amounts, and starting money that you enter. It does not connect to financial institutions, move money, guarantee that income arrives, or provide financial, debt, tax, or legal advice. Check each invoice and account before paying.</p><h2>Plus purchase</h2><p>Plus is a one-time $19 license for the features described at checkout. Sociobot/Dodo is the merchant of record and handles payment and refunds. A refund revokes the associated license. Availability of the free planner and data export is not conditional on purchase.</p><h2>Warranty</h2><p>The software is provided “as is” without warranty. You remain responsible for entered data, backups, and payment decisions. These terms are governed by applicable law and do not limit rights that cannot legally be limited.</p>`}
  <p class="legal-date">Effective 28 August 2026 · <a href="/">Return to Bill Runway</a></p></main>${footer()}`;
}

function footer() {
  return `<footer><p>Private by design. No bank connection, ads, or tracking.</p><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><p class="art-credit">Original AI-assisted cut-paper artwork, made for Bill Runway.</p></footer>`;
}

function renderEntryDialog(): string {
  const entry = editingId ? data.entries.find(item => item.id === editingId) : undefined;
  const kind = entry?.kind ?? dialogKind;
  return `<dialog id="entry-dialog" aria-labelledby="dialog-title"><form id="entry-form" method="dialog" novalidate>
    <div class="dialog-heading"><div><p class="eyebrow">${entry ? 'Update waypoint' : 'New waypoint'}</p><h2 id="dialog-title">${entry ? 'Edit' : 'Add'} ${kind}</h2></div><button class="icon-button close-dialog" type="button" aria-label="Close dialog">×</button></div>
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

function renderSettingsDialog(): string {
  const s = data.settings;
  return `<dialog id="settings-dialog" aria-labelledby="settings-title"><form id="settings-form" method="dialog" novalidate>
  <div class="dialog-heading"><div><p class="eyebrow">Starting point</p><h2 id="settings-title">Plan settings</h2></div><button class="icon-button close-settings" type="button" aria-label="Close dialog">×</button></div>
  <label>Plan name <input name="planName" maxlength="40" required value="${esc(s.planName)}"></label>
  <div class="field-row"><label>Money available now <input name="balance" inputmode="decimal" required value="${(s.balanceCents / 100).toFixed(2)}"></label><label>Currency <select name="currency">${['USD', 'GBP', 'EUR', 'INR', 'CAD', 'AUD'].map(c => `<option ${c === s.currency ? 'selected' : ''}>${c}</option>`).join('')}</select></label></div>
  <p class="field-help">Use money that can actually pay these bills today. Update it after payments or deposits clear.</p><p id="settings-error" class="form-error" role="alert"></p>
  <div class="dialog-actions">${button('Cancel', 'button ghost close-settings', 'type="button"')}${button('Save settings', 'button primary', 'type="submit"')}</div></form></dialog>`;
}

function renderLicenseDialog(): string {
  return `<dialog id="license-dialog" aria-labelledby="license-title"><form id="license-form" method="dialog" novalidate><div class="dialog-heading"><div><p class="eyebrow">One-time unlock</p><h2 id="license-title">See the longer road</h2></div><button class="icon-button close-license" type="button" aria-label="Close dialog">×</button></div>
  <p>Bill Runway Plus extends the forecast from 60 days to a full 12 months. Pay once: <strong>$19</strong>. Your core planner, recurring bills, printing, and backups stay free.</p>
  <a class="button primary full" href="${BILLING_BASE}/products/bill-runway/checkout">Buy Plus for $19</a>
  <div class="or"><span>or restore a purchase</span></div><label>License token <input name="license" autocomplete="off" spellcheck="false" required></label><p class="field-help">Verification contacts Sociobot. Card details never enter this app.</p><p id="license-error" class="form-error" role="alert"></p>
  <div class="dialog-actions">${button('Cancel', 'button ghost close-license', 'type="button"')}${button('Verify license', 'button secondary', 'type="submit"')}</div><p class="fine-print">Purchase subject to our <a href="/terms">terms</a> and <a href="/privacy">privacy notice</a>. Sociobot/Dodo is merchant of record and handles refunds.</p></form></dialog>`;
}

function entryList(kind: EntryKind): string {
  const entries = data.entries.filter(e => e.kind === kind).sort((a, b) => a.firstDate.localeCompare(b.firstDate));
  if (!entries.length) return `<p class="mini-empty">No ${kind === 'bill' ? 'bills' : 'income'} added yet.</p>`;
  return `<ul class="entry-list">${entries.map(e => `<li><button class="entry-edit" data-edit="${e.id}"><span><strong>${esc(e.name)}</strong><small>${dateLabel(e.firstDate)} · ${recurrenceLabel(e.recurrence)}</small></span><b>${kind === 'income' ? '+' : '−'}${formatMoney(e.amountCents, data.settings.currency)}</b><span class="sr-only">Edit ${esc(e.name)}</span></button></li>`).join('')}</ul>`;
}

function timeline(occurrences: Occurrence[]): string {
  if (!occurrences.length) return `<section class="empty-timeline"><h2>Your runway is clear—for now.</h2><p>Add a bill or expected income to map the next 60 days.</p>${button('Add your first bill', 'button primary', 'data-open="bill"')}</section>`;
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
  <header class="site-header"><a class="brand" href="/" aria-label="Bill Runway home"><span class="brand-mark" aria-hidden="true"></span>Bill Runway</a><nav aria-label="App controls">${button('Install', 'button ghost install-button', installPrompt ? '' : 'hidden')} ${button('◐', 'icon-button', 'id="theme-toggle" aria-label="Switch color theme"')} ${button('Plan settings', 'button secondary', 'id="open-settings"')}</nav></header>
  <main id="main">
    <section class="hero"><div class="hero-copy"><p class="eyebrow">A due-date cash runway</p><h1>See the gap<br>before it arrives.</h1><p class="lede">Map bills against expected income. No bank connection. No full budget. Just what needs to clear next.</p><div class="hero-actions">${button('Add bill', 'button primary', 'data-open="bill"')}${button('Add income', 'button secondary', 'data-open="income"')}</div><p class="advice-note">Forecast from your entries—not financial advice.</p></div><picture class="hero-art"><source media="(max-width: 620px)" srcset="/art/runway-hero-720.webp"><img src="/art/runway-hero-1200.webp" width="1200" height="800" alt="A coral paper causeway crossing dark-blue tidal flats toward a low amber sun" fetchpriority="high" decoding="async"></picture></section>
    <section class="runway-shell" aria-labelledby="runway-title"><div class="section-heading"><div><p class="eyebrow">${esc(data.settings.planName)}</p><h2 id="runway-title">The next ${days} days</h2></div><div class="range-switch" aria-label="Forecast range"><button class="${days === 60 ? 'active' : ''}" data-days="60" aria-pressed="${days === 60}">60 days</button><button class="${days === 365 ? 'active' : ''}" data-days="365" aria-pressed="${days === 365}">12 months ${isPlus ? '' : '<span aria-label="Plus required">◇</span>'}</button></div></div>
    <div class="summary-strip"><div><span>Available now</span><strong>${formatMoney(data.settings.balanceCents, data.settings.currency)}</strong></div><div><span>Bills in range</span><strong>${formatMoney(dueTotal, data.settings.currency)}</strong></div><div class="${lowest < 0 ? 'negative' : ''}"><span>Lowest point</span><strong>${formatMoney(lowest, data.settings.currency)}</strong></div><div class="coverage"><span>Coverage</span><strong>${firstGap ? `Gap on ${dateLabel(firstGap.date)}` : 'All covered'}</strong></div></div>
    ${firstGap ? `<div class="gap-callout" role="status"><span class="gap-icon" aria-hidden="true">!</span><p><strong>${formatMoney(firstGap.uncovered, data.settings.currency)} is uncovered by ${dateLabel(firstGap.date)}.</strong><br>That is the first point where entered bills exceed available money and expected income.</p></div>` : occurrences.length ? `<div class="clear-callout" role="status"><span aria-hidden="true">✓</span><p><strong>The path is covered.</strong> Your entered money and income cover every bill in this range.</p></div>` : ''}
    <div class="runway-grid"><section class="timeline" aria-labelledby="timeline-title"><div class="subheading"><h3 id="timeline-title">Payment run</h3><div>${button('Print one-page run', 'button ghost', 'id="print-run"')}${button('Export CSV', 'button ghost', 'id="export-csv"')}</div></div>${timeline(occurrences)}</section>
    <aside class="waypoints" aria-label="Plan entries"><section><div class="subheading"><h3>Bills</h3>${button('+ Add', 'button text-button', 'data-open="bill"')}</div>${entryList('bill')}</section><section><div class="subheading"><h3>Expected income</h3>${button('+ Add', 'button text-button', 'data-open="income"')}</div>${entryList('income')}</section><section class="data-tools"><h3>Your data</h3><p>Stored only in this browser.</p><div>${button('Back up data', 'button ghost', 'id="export-json"')}<label class="button ghost file-button">Import backup<input id="import-json" type="file" accept="application/json"></label></div></section></aside></div></section>
    <section class="plus-band"><div><p class="eyebrow">Bill Runway Plus</p><h2>Look beyond the next bend.</h2><p>${isPlus ? 'Your 12-month runway is unlocked on this device.' : 'Extend your view to 12 months with a $19 one-time purchase. No subscription.'}</p></div>${isPlus ? '<span class="plus-active">✓ Plus active</span>' : button('See the Plus unlock', 'button ink', 'id="open-license"')}</section>
  </main>${footer()}${renderEntryDialog()}${renderSettingsDialog()}${renderLicenseDialog()}`;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach(el => el.addEventListener('click', () => openEntry(el.dataset.open as EntryKind)));
  document.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(el => el.addEventListener('click', () => openEntry(data.entries.find(e => e.id === el.dataset.edit)!.kind, el.dataset.edit)));
  document.querySelectorAll<HTMLButtonElement>('.close-dialog').forEach(el => el.addEventListener('click', () => (document.querySelector('#entry-dialog') as HTMLDialogElement).close()));
  document.querySelectorAll<HTMLButtonElement>('.close-settings').forEach(el => el.addEventListener('click', () => (document.querySelector('#settings-dialog') as HTMLDialogElement).close()));
  document.querySelectorAll<HTMLButtonElement>('.close-license').forEach(el => el.addEventListener('click', () => (document.querySelector('#license-dialog') as HTMLDialogElement).close()));
  document.querySelector('#entry-form')?.addEventListener('submit', submitEntry);
  document.querySelector('#settings-form')?.addEventListener('submit', submitSettings);
  document.querySelector('#license-form')?.addEventListener('submit', submitLicense);
  document.querySelector('#delete-entry')?.addEventListener('click', removeCurrentEntry);
  document.querySelector('#open-settings')?.addEventListener('click', () => (document.querySelector('#settings-dialog') as HTMLDialogElement).showModal());
  document.querySelector('#open-license')?.addEventListener('click', () => (document.querySelector('#license-dialog') as HTMLDialogElement).showModal());
  document.querySelectorAll<HTMLButtonElement>('[data-days]').forEach(el => el.addEventListener('click', () => changeDays(Number(el.dataset.days))));
  document.querySelectorAll<HTMLButtonElement>('[data-paid]').forEach(el => el.addEventListener('click', () => togglePaid(el.dataset.paid!, el.dataset.date!)));
  document.querySelector('#print-run')?.addEventListener('click', () => window.print());
  document.querySelector('#export-csv')?.addEventListener('click', exportCSV);
  document.querySelector('#export-json')?.addEventListener('click', exportJSON);
  document.querySelector('#import-json')?.addEventListener('change', importJSON);
  document.querySelector('#theme-toggle')?.addEventListener('click', toggleTheme);
  document.querySelector('.install-button')?.addEventListener('click', installApp);
  document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
}

function openEntry(kind: EntryKind, id: string | null = null) {
  dialogKind = kind; editingId = id; renderPlanner();
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
  if (!name) { error.textContent = 'Enter a name for this waypoint.'; return; }
  if (amount === null || amount <= 0) { error.textContent = 'Enter a positive amount with no more than two decimal places.'; return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(firstDate)) { error.textContent = 'Choose a valid date.'; return; }
  const old = editingId ? data.entries.find(e => e.id === editingId) : undefined;
  const now = new Date().toISOString();
  const entry: Entry = { id: old?.id ?? crypto.randomUUID(), kind: String(fd.get('kind')) as EntryKind, name, amountCents: amount, firstDate, recurrence: String(fd.get('recurrence')) as Recurrence, note: String(fd.get('note')).trim(), paidDates: old?.paidDates ?? [], createdAt: old?.createdAt ?? now, updatedAt: now };
  await saveEntry(entry);
  data.entries = old ? data.entries.map(e => e.id === entry.id ? entry : e) : [...data.entries, entry];
  renderPlanner(); announce(`${entry.kind === 'bill' ? 'Bill' : 'Income'} ${entry.name} saved.`);
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
  if (next === 365 && !isPlus) { (document.querySelector('#license-dialog') as HTMLDialogElement).showModal(); return; }
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
    const parsed = JSON.parse(await file.text()) as AppData;
    if (parsed.version !== 1 || !Array.isArray(parsed.entries) || parsed.entries.length > 5000 || !parsed.settings
      || typeof parsed.settings.planName !== 'string' || !['USD', 'GBP', 'EUR', 'INR', 'CAD', 'AUD'].includes(parsed.settings.currency)
      || !Number.isSafeInteger(parsed.settings.balanceCents) || parsed.settings.balanceCents < 0
      || parsed.entries.some(e => typeof e.id !== 'string' || !e.id || typeof e.name !== 'string' || typeof e.note !== 'string'
        || !['bill', 'income'].includes(e.kind) || !['none', 'weekly', 'monthly', 'yearly'].includes(e.recurrence)
        || typeof e.firstDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.firstDate) || !Number.isSafeInteger(e.amountCents)
        || e.amountCents <= 0 || !Array.isArray(e.paidDates) || e.paidDates.some(date => typeof date !== 'string'))) throw new Error('shape');
    if (!confirm(`Replace this plan with ${parsed.entries.length} imported entries? A backup first is recommended.`)) return;
    await replaceData(parsed); data = await loadData(); renderPlanner(); announce('Backup imported.');
  } catch { announce('Import failed. Choose an unmodified Bill Runway JSON backup.'); }
  finally { input.value = ''; }
}

function toggleTheme() {
  const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'light' : 'dark'; localStorage.setItem('bill-runway-theme', dark ? 'light' : 'dark');
}

async function submitLicense(event: Event) {
  event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const token = String(new FormData(form).get('license')).trim(); const error = form.querySelector<HTMLElement>('#license-error')!;
  if (!token) { error.textContent = 'Paste the license token from your receipt.'; return; }
  error.textContent = 'Checking license…';
  const valid = await verifyLicense(token, true);
  if (!valid) { error.textContent = online ? 'That license is not active for Bill Runway. Check the token or buy a new license.' : 'Connect to the internet to verify this license once.'; return; }
  renderPlanner(); announce('Plus unlocked. Your 12-month runway is ready.');
}

async function verifyLicense(token: string, force = false): Promise<boolean> {
  const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as { token: string; valid: boolean; checkedAt: number } | null;
  if (!force && cached?.token === token && cached.valid) isPlus = true;
  if (!force && cached?.token === token && Date.now() - cached.checkedAt < 86_400_000) return cached.valid;
  try {
    const response = await fetch(`${BILLING_BASE}/products/bill-runway/verify?license=${encodeURIComponent(token)}`);
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ token, valid: result.valid, checkedAt: Date.now() }));
    if (result.valid) localStorage.setItem(LICENSE_KEY, token); else localStorage.removeItem(LICENSE_KEY);
    isPlus = result.valid; return result.valid;
  } catch { return Boolean(cached?.valid); }
}

async function installApp() { if (installPrompt) { await installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; renderPlanner(); } }

async function init() {
  const theme = localStorage.getItem('bill-runway-theme'); if (theme) document.documentElement.dataset.theme = theme;
  if (location.pathname === '/privacy' || location.pathname === '/privacy/') { app.innerHTML = legalPage('privacy'); return; }
  if (location.pathname === '/terms' || location.pathname === '/terms/') { app.innerHTML = legalPage('terms'); return; }
  const url = new URL(location.href); const returnedLicense = url.searchParams.get('license');
  if (returnedLicense) { localStorage.setItem(LICENSE_KEY, returnedLicense); url.searchParams.delete('license'); history.replaceState({}, '', url); }
  const token = returnedLicense || localStorage.getItem(LICENSE_KEY); if (token) void verifyLicense(token).then(() => renderPlanner());
  try { data = await loadData(); renderPlanner(); } catch { app.innerHTML = `<main id="main" class="fatal"><h1>Bill Runway could not open local storage.</h1><p>Allow site data for this browser, then reload. Nothing has been sent anywhere.</p><button class="button primary" onclick="location.reload()">Try again</button></main>`; }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then(reg => { reg.addEventListener('updatefound', () => { const worker = reg.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) announce('An update is ready. Reload to use it.'); }); }); }).catch(() => {});
}

window.addEventListener('online', () => { online = true; document.querySelector('#offline-bar')?.setAttribute('hidden', ''); announce('Back online.'); });
window.addEventListener('offline', () => { online = false; document.querySelector('#offline-bar')?.removeAttribute('hidden'); announce('You are offline. Your saved plan still works.'); });
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event as BeforeInstallPromptEvent; if (data) renderPlanner(); });

void init();

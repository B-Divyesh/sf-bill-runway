import type { Entry, Occurrence, Recurrence } from './types';

export function parseMoney(value: string): number | null {
  const clean = value.trim().replace(/,/g, '');
  if (!/^\d+(?:\.\d{0,2})?$/.test(clean)) return null;
  const [whole, fraction = ''] = clean.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents >= 0 ? cents : null;
}

/**
 * Checks a calendar date, rather than only checking the shape of an ISO date.
 * `new Date(2026, 8, 31)` normalises to October 1, which is not safe for a
 * cash forecast. Keep this guard at the data boundary before dates reach the
 * recurrence code below.
 */
export function isValidISODate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setHours(12, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(cents / 100);
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(iso: string, days: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function fromISO(iso: string): Date {
  if (!isValidISODate(iso)) throw new RangeError(`Invalid ISO calendar date: ${iso}`);
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function occurrenceDate(first: string, recurrence: Recurrence, index: number): string {
  const base = fromISO(first);
  if (recurrence === 'weekly') base.setDate(base.getDate() + index * 7);
  if (recurrence === 'monthly') {
    const wanted = base.getDate();
    base.setDate(1);
    base.setMonth(base.getMonth() + index);
    base.setDate(Math.min(wanted, new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()));
  }
  if (recurrence === 'yearly') {
    const wanted = base.getDate();
    const month = base.getMonth();
    base.setDate(1);
    base.setFullYear(base.getFullYear() + index);
    base.setMonth(month);
    base.setDate(Math.min(wanted, new Date(base.getFullYear(), month + 1, 0).getDate()));
  }
  return toISO(base);
}

export function datesFor(entry: Entry, start: string, end: string): string[] {
  const dates: string[] = [];
  let index = 0;
  let current = entry.firstDate;
  while (current < start && entry.recurrence !== 'none' && index < 1000) current = occurrenceDate(entry.firstDate, entry.recurrence, ++index);
  while (current <= end && index < 1200) {
    if (current >= start) dates.push(current);
    if (entry.recurrence === 'none') break;
    current = occurrenceDate(entry.firstDate, entry.recurrence, ++index);
  }
  return dates;
}

export function buildRunway(entries: Entry[], balanceCents: number, start: string, days: number): Occurrence[] {
  const end = addDays(start, days);
  const raw = entries.flatMap(entry => datesFor(entry, start, end).map(date => ({
    key: `${entry.id}:${date}`, entry, date, paid: entry.paidDates.includes(date)
  })));
  raw.sort((a, b) => a.date.localeCompare(b.date)
    || (a.entry.kind === b.entry.kind ? 0 : a.entry.kind === 'income' ? -1 : 1)
    || a.entry.name.localeCompare(b.entry.name));
  let balance = balanceCents;
  return raw.map(item => {
    if (!item.paid) balance += item.entry.kind === 'income' ? item.entry.amountCents : -item.entry.amountCents;
    return { ...item, balanceAfter: balance, uncovered: Math.max(0, -balance) };
  });
}

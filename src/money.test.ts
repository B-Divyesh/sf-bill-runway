import { describe, expect, it } from 'vitest';
import { buildRunway, datesFor, isValidISODate, parseMoney } from './money';
import { isValidAppData } from './data-validation';
import type { Entry } from './types';

const entry = (overrides: Partial<Entry> = {}): Entry => ({
  id: 'a', kind: 'bill', name: 'Rent', amountCents: 10000, firstDate: '2026-01-31', recurrence: 'monthly', note: '', paidDates: [], createdAt: '', updatedAt: '', ...overrides
});

describe('decimal-safe money', () => {
  it('parses user amounts without floating point rounding', () => {
    expect(parseMoney('1,234.56')).toBe(123456);
    expect(parseMoney('0.10')).toBe(10);
    expect(parseMoney('12.345')).toBeNull();
    expect(parseMoney('-4')).toBeNull();
  });
});

describe('calendar dates', () => {
  it('accepts real ISO calendar dates including leap days and rejects normalised dates', () => {
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(isValidISODate('2026-02-29')).toBe(false);
    expect(isValidISODate('2026-09-31')).toBe(false);
    expect(isValidISODate('2026-09-30')).toBe(true);
    expect(isValidISODate('2000-02-29')).toBe(true);
    expect(isValidISODate('1900-02-29')).toBe(false);
    expect(isValidISODate('0000-01-01')).toBe(false);
    expect(isValidISODate('2026-00-10')).toBe(false);
  });

  it('rejects backups with impossible first or paid dates before replacing local data', () => {
    const backup = { version: 1, settings: { balanceCents: 0, currency: 'USD', planName: 'Test' }, entries: [entry()] };
    expect(isValidAppData(backup)).toBe(true);
    expect(isValidAppData({ ...backup, entries: [entry({ firstDate: '2026-09-31' })] })).toBe(false);
    expect(isValidAppData({ ...backup, entries: [entry({ paidDates: ['2026-02-29'] })] })).toBe(false);
    expect(isValidAppData({ ...backup, entries: [entry({ firstDate: '2024-02-29', paidDates: ['2024-02-29'] })] })).toBe(true);
  });
});

describe('recurrence', () => {
  it('clamps month-end dates', () => {
    expect(datesFor(entry(), '2026-01-01', '2026-04-30')).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
  });
});

describe('runway', () => {
  it('applies income before bills on the same date and identifies gaps', () => {
    const events = buildRunway([
      entry({ firstDate: '2026-02-01', recurrence: 'none', amountCents: 15000 }),
      entry({ id: 'b', kind: 'income', name: 'Pay', firstDate: '2026-02-01', recurrence: 'none', amountCents: 10000 })
    ], 2000, '2026-02-01', 1);
    expect(events.map(e => e.entry.kind)).toEqual(['income', 'bill']);
    expect(events.at(-1)?.uncovered).toBe(3000);
  });

  it('does not deduct an occurrence already marked paid', () => {
    const [event] = buildRunway([entry({ firstDate: '2026-02-01', recurrence: 'none', paidDates: ['2026-02-01'] })], 5000, '2026-02-01', 1);
    expect(event.balanceAfter).toBe(5000);
  });
});

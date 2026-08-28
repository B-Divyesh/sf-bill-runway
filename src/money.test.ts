import { describe, expect, it } from 'vitest';
import { buildRunway, datesFor, parseMoney } from './money';
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

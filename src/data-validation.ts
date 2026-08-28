import { isValidISODate } from './money';
import type { AppData, Entry } from './types';

const currencies = new Set(['USD', 'GBP', 'EUR', 'INR', 'CAD', 'AUD']);
const recurrences = new Set(['none', 'weekly', 'monthly', 'yearly']);
const kinds = new Set(['bill', 'income']);

/** Runtime boundary for imports and data recovered from IndexedDB. */
export function isValidEntry(value: unknown): value is Entry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<Entry>;
  return typeof entry.id === 'string' && entry.id.length > 0
    && typeof entry.name === 'string' && typeof entry.note === 'string'
    && typeof entry.kind === 'string' && kinds.has(entry.kind)
    && typeof entry.recurrence === 'string' && recurrences.has(entry.recurrence)
    && isValidISODate(entry.firstDate)
    && typeof entry.amountCents === 'number' && Number.isSafeInteger(entry.amountCents) && entry.amountCents > 0
    && Array.isArray(entry.paidDates) && entry.paidDates.every(isValidISODate);
}

/** Reject malformed backups before they can replace the local plan. */
export function isValidAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<AppData>;
  return data.version === 1
    && Array.isArray(data.entries) && data.entries.length <= 5000 && data.entries.every(isValidEntry)
    && Boolean(data.settings)
    && typeof data.settings?.planName === 'string'
    && typeof data.settings?.currency === 'string' && currencies.has(data.settings.currency)
    && Number.isSafeInteger(data.settings?.balanceCents) && data.settings.balanceCents >= 0;
}

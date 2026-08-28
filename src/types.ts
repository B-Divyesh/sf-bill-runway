export type Recurrence = 'none' | 'weekly' | 'monthly' | 'yearly';
export type EntryKind = 'bill' | 'income';

export interface Entry {
  id: string;
  kind: EntryKind;
  name: string;
  amountCents: number;
  firstDate: string;
  recurrence: Recurrence;
  note: string;
  paidDates: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  balanceCents: number;
  currency: 'USD' | 'GBP' | 'EUR' | 'INR' | 'CAD' | 'AUD';
  planName: string;
  updatedAt: string;
}

export interface AppData {
  version: 1;
  entries: Entry[];
  settings: Settings;
  exportedAt?: string;
}

export interface Occurrence {
  key: string;
  entry: Entry;
  date: string;
  paid: boolean;
  balanceAfter: number;
  uncovered: number;
}

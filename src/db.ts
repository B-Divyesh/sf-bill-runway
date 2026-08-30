import type { AppData, Entry, Settings } from './types';
import { isValidEntry } from './data-validation';

const REAL_DB_NAME = 'bill-runway';
const DEMO_DB_NAME = 'demo:bill-runway';
const DB_VERSION = 2;
const initialSettings: Settings = { balanceCents: 0, currency: 'USD', planName: 'My plan', updatedAt: new Date(0).toISOString() };
let dbName = REAL_DB_NAME;

/** Select the isolated demo database before any storage operation runs. */
export function configureStorageNamespace(demo: boolean): void {
  dbName = demo ? DEMO_DB_NAME : REAL_DB_NAME;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);
    request.onupgradeneeded = event => {
      const db = request.result;
      if (!db.objectStoreNames.contains('entries')) db.createObjectStore('entries', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
      // V1 accepted date-shaped strings such as 2026-09-31. Reject those
      // records during migration so an impossible due date can never be
      // normalised into a different day by the forecast engine.
      if ((event as IDBVersionChangeEvent).oldVersion < 2 && db.objectStoreNames.contains('entries')) {
        const entries = request.transaction!.objectStore('entries');
        const cursor = entries.openCursor();
        cursor.onsuccess = () => {
          const current = cursor.result;
          if (!current) return;
          if (!isValidEntry(current.value)) current.delete();
          current.continue();
        };
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Discard only the sample workspace. Real plan data is never opened here. */
export function deleteDemoData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DEMO_DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Demo database is still open'));
  });
}

function request<T>(value: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(value.error);
  });
}

export async function loadData(): Promise<AppData> {
  const db = await openDB();
  const tx = db.transaction(['entries', 'settings'], 'readonly');
  const storedEntries = await request(tx.objectStore('entries').getAll()) as Entry[];
  const record = await request(tx.objectStore('settings').get('main')) as { key: string; value: Settings } | undefined;
  db.close();
  // Defense in depth for manually-corrupted IndexedDB records after migration.
  // Invalid records are ignored rather than allowed to silently alter a date.
  return { version: 1, entries: storedEntries.filter(isValidEntry), settings: record?.value ?? initialSettings };
}

export async function saveEntry(entry: Entry): Promise<void> {
  const db = await openDB();
  await request(db.transaction('entries', 'readwrite').objectStore('entries').put(entry));
  db.close();
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await openDB();
  await request(db.transaction('entries', 'readwrite').objectStore('entries').delete(id));
  db.close();
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await openDB();
  await request(db.transaction('settings', 'readwrite').objectStore('settings').put({ key: 'main', value: settings }));
  db.close();
}

export async function replaceData(data: AppData): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(['entries', 'settings'], 'readwrite');
  tx.objectStore('entries').clear();
  data.entries.forEach(entry => tx.objectStore('entries').put(entry));
  tx.objectStore('settings').put({ key: 'main', value: data.settings });
  await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
  db.close();
}

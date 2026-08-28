import type { AppData, Entry, Settings } from './types';

const DB_NAME = 'bill-runway';
const DB_VERSION = 1;
const initialSettings: Settings = { balanceCents: 0, currency: 'USD', planName: 'My runway', updatedAt: new Date(0).toISOString() };

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('entries')) db.createObjectStore('entries', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
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
  const entries = await request(tx.objectStore('entries').getAll()) as Entry[];
  const record = await request(tx.objectStore('settings').get('main')) as { key: string; value: Settings } | undefined;
  db.close();
  return { version: 1, entries, settings: record?.value ?? initialSettings };
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

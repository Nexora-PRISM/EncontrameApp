import { type IdSheet, parseIdSheet, purgeExpiredDayPhoto, sortIdSheets } from '@/lib/id-sheet-rules';

/**
 * Fichas de identificação na versão web: IndexedDB deste navegador. Nada vai para a API.
 * Ao ler, a foto do dia vencida (mais de 24 h) é apagada de vez.
 */
const DB_NAME = 'encontrame-id-sheets';
const STORE_NAME = 'id_sheets';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB indisponível neste navegador.'));
        return;
      }
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error ?? new Error('Falha ao abrir IndexedDB.'));
      };
    });
  }
  return dbPromise;
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = action(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Falha no IndexedDB.'));
  });
}

async function readAndPurge(raw: unknown): Promise<IdSheet | null> {
  const parsed = parseIdSheet(raw);
  if (!parsed) return null;
  const purged = purgeExpiredDayPhoto(parsed, new Date());
  if (purged !== parsed) await saveIdSheet(purged);
  return purged;
}

export async function listIdSheets(): Promise<IdSheet[]> {
  const rows = await run('readonly', (store) => store.getAll());
  const sheets: IdSheet[] = [];
  for (const row of rows) {
    const sheet = await readAndPurge(row);
    if (sheet) sheets.push(sheet);
  }
  return sortIdSheets(sheets);
}

export async function getIdSheet(id: string): Promise<IdSheet | null> {
  const row = await run('readonly', (store) => store.get(id));
  return row ? readAndPurge(row) : null;
}

export async function saveIdSheet(sheet: IdSheet): Promise<void> {
  await run('readwrite', (store) => store.put(sheet));
}

export async function deleteIdSheet(id: string): Promise<void> {
  await run('readwrite', (store) => store.delete(id));
}

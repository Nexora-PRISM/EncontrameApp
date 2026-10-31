import * as SQLite from 'expo-sqlite';

import { type IdSheet, parseIdSheet, purgeExpiredDayPhoto, sortIdSheets } from '@/lib/id-sheet-rules';

/**
 * Fichas de identificação guardadas só neste aparelho (SQLite). Nada vai para a API.
 * Ao ler, a foto do dia vencida (mais de 24 h) é apagada de vez.
 */
const DB_NAME = 'encontrame-id-sheets.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS id_sheets (
          id TEXT PRIMARY KEY NOT NULL,
          sheet_json TEXT NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

async function readAndPurge(json: string): Promise<IdSheet | null> {
  let parsed: IdSheet | null = null;
  try {
    parsed = parseIdSheet(JSON.parse(json));
  } catch {
    return null;
  }
  if (!parsed) return null;
  const purged = purgeExpiredDayPhoto(parsed, new Date());
  if (purged !== parsed) await saveIdSheet(purged);
  return purged;
}

export async function listIdSheets(): Promise<IdSheet[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ sheet_json: string }>('SELECT sheet_json FROM id_sheets');
  const sheets: IdSheet[] = [];
  for (const row of rows) {
    const sheet = await readAndPurge(row.sheet_json);
    if (sheet) sheets.push(sheet);
  }
  return sortIdSheets(sheets);
}

export async function getIdSheet(id: string): Promise<IdSheet | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ sheet_json: string }>('SELECT sheet_json FROM id_sheets WHERE id = ?', id);
  return row ? readAndPurge(row.sheet_json) : null;
}

export async function saveIdSheet(sheet: IdSheet): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO id_sheets (id, sheet_json) VALUES (?, ?)', sheet.id, JSON.stringify(sheet));
}

export async function deleteIdSheet(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM id_sheets WHERE id = ?', id);
}

import * as SQLite from 'expo-sqlite';

// Simple Custom Emitter
class SimpleEmitter {
  listeners: (() => void)[] = [];
  on(listener: () => void) { this.listeners.push(listener); }
  off(listener: () => void) { this.listeners = this.listeners.filter(l => l !== listener); }
  emit() { this.listeners.forEach(l => l()); }
}
const tableEvents = new SimpleEmitter();

let _db: SQLite.SQLiteDatabase | null = null;

const getDb = async () => {
  if (_db) {
    try {
      await _db.execAsync('SELECT 1');
      return _db;
    } catch (e) {
      _db = null;
    }
  }
  _db = await SQLite.openDatabaseAsync('centria_sovereign.db');
  
  // Ensure tables exist
  await _db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, name TEXT, currency TEXT, monthly_income REAL, created_at TEXT);
    CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, user_id TEXT, amount REAL, category TEXT, note TEXT, date TEXT);
    CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, user_id TEXT, name TEXT, price REAL, cycle TEXT, next_billing_date TEXT, icon TEXT, active INTEGER);
    CREATE TABLE IF NOT EXISTS reminders (id TEXT PRIMARY KEY, user_id TEXT, title TEXT, date TEXT, type TEXT, completed INTEGER, linked_subscription_id TEXT);
    CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, user_id TEXT, name TEXT, category TEXT, file_path TEXT, file_type TEXT, expiry_date TEXT);
  `);
  
  return _db;
};

export const db = {
  init: async () => {
    await getDb();
  },
  execute: async (sql: string, params: any[] = []) => {
    const database = await getDb();
    // Using a transaction for safer writes and better connection handling
    await database.withTransactionAsync(async () => {
      await database.runAsync(sql, params);
    });
    tableEvents.emit();
  },
  getAll: async (sql: string, params: any[] = []) => {
    const database = await getDb();
    return await database.getAllAsync(sql, params);
  },
  watch: (sql: string, params: any[], options: { onResult: (result: any) => void }) => {
    const runQuery = async () => {
      try {
        const database = await getDb();
        const rows = await database.getAllAsync(sql, params);
        options.onResult({
          rows: {
            length: rows.length,
            item: (i: number) => rows[i],
            _array: rows
          }
        });
      } catch (e) {
        console.warn('Watch Error:', e);
      }
    };
    runQuery();
    const listener = () => runQuery();
    tableEvents.on(listener);
    return { close: () => tableEvents.off(listener) };
  },
  connect: async () => {},
  disconnectAndClear: async () => {
    const database = await getDb();
    await database.execAsync('DELETE FROM expenses; DELETE FROM subscriptions; DELETE FROM reminders; DELETE FROM documents;');
    tableEvents.emit();
  }
};

export const connector = {};

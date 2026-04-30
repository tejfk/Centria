import {
  Schema,
  Table,
  Column,
  ColumnType,
  PowerSyncDatabase,
  AbstractPowerSyncDatabase
} from '@powersync/react-native';
import { supabase } from './supabase';
import { SQLWatchRegistration } from '@powersync/react-native';

// 1. Define the Schema for the Local SQLite Database
// This MUST match your Supabase tables
export const CentriaSchema = new Schema([
  new Table({
    name: 'profiles',
    columns: [
      new Column({ name: 'name', type: ColumnType.TEXT }),
      new Column({ name: 'currency', type: ColumnType.TEXT }),
      new Column({ name: 'monthly_income', type: ColumnType.REAL }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'expenses',
    columns: [
      new Column({ name: 'user_id', type: ColumnType.TEXT }),
      new Column({ name: 'amount', type: ColumnType.REAL }),
      new Column({ name: 'category', type: ColumnType.TEXT }),
      new Column({ name: 'note', type: ColumnType.TEXT }),
      new Column({ name: 'date', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'subscriptions',
    columns: [
      new Column({ name: 'user_id', type: ColumnType.TEXT }),
      new Column({ name: 'name', type: ColumnType.TEXT }),
      new Column({ name: 'price', type: ColumnType.REAL }),
      new Column({ name: 'cycle', type: ColumnType.TEXT }),
      new Column({ name: 'next_billing_date', type: ColumnType.TEXT }),
      new Column({ name: 'icon', type: ColumnType.TEXT }),
      new Column({ name: 'active', type: ColumnType.INTEGER }), // SQLite uses integers for boolean
    ],
  }),
  new Table({
    name: 'reminders',
    columns: [
      new Column({ name: 'user_id', type: ColumnType.TEXT }),
      new Column({ name: 'title', type: ColumnType.TEXT }),
      new Column({ name: 'date', type: ColumnType.TEXT }),
      new Column({ name: 'type', type: ColumnType.TEXT }),
      new Column({ name: 'completed', type: ColumnType.INTEGER }),
      new Column({ name: 'linked_subscription_id', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'documents',
    columns: [
      new Column({ name: 'user_id', type: ColumnType.TEXT }),
      new Column({ name: 'name', type: ColumnType.TEXT }),
      new Column({ name: 'category', type: ColumnType.TEXT }),
      new Column({ name: 'file_path', type: ColumnType.TEXT }),
      new Column({ name: 'file_type', type: ColumnType.TEXT }),
      new Column({ name: 'expiry_date', type: ColumnType.TEXT }),
    ],
  }),
]);

import { SQLJSOpenFactory } from '@powersync/adapter-sql-js';

// 2. Initialize the PowerSync Database
export const db = new PowerSyncDatabase({
  schema: CentriaSchema,
  database: new SQLJSOpenFactory({
    dbFilename: 'centria_offline.db',
  }),
});

// 3. Supabase Connector
// This handles the authentication and the "Upload" of local changes to Supabase
export class SupabaseConnector {
  async fetchCredentials() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;

    return {
      endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL || '',
      token: session.access_token,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase) {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    try {
      for (const op of transaction.crud) {
        const table = op.table;
        const data = op.opData;

        if (op.op === 'PUT') {
          await supabase.from(table).upsert({ id: op.id, ...data });
        } else if (op.op === 'PATCH') {
          await supabase.from(table).update(data).eq('id', op.id);
        } else if (op.op === 'DELETE') {
          await supabase.from(table).delete().eq('id', op.id);
        }
      }
      await transaction.complete();
    } catch (e) {
      console.error('Error uploading data to Supabase:', e);
      throw e;
    }
  }
}

export const connector = new SupabaseConnector();

import { db } from "@/src/database/db";

export const migrateV1 = async () => {
  if (!db) {
    console.log('db initialize error')
    return;
  }
  console.log("Running migration V1: Remove synced and user_id");

  await db.withTransactionAsync(async () => {
    await db!.execAsync(`
      CREATE TABLE IF NOT EXISTS entries_tmp (
        id TEXT PRIMARY KEY,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        date TEXT,
        text TEXT
      );
    `);

    const result = await db!.getFirstAsync(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='entries';
    `);

    const entriesExists = !!result;

    if (entriesExists) {
      await db!.execAsync(`
        INSERT INTO entries_tmp (id, created_at, updated_at, deleted_at, date, text)
        SELECT id, created_at, updated_at, deleted_at, date, text FROM entries;

        DROP TABLE entries;
      `);
    }

    await db!.execAsync(`
      ALTER TABLE entries_tmp RENAME TO entries;
      CREATE INDEX IF NOT EXISTS idx_date ON entries (date);
    `);
  });
};

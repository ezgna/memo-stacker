import * as SQLite from "expo-sqlite";

export let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("MemoLogMinute.db");
  }
}; 
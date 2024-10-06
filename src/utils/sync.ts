import { Entry } from "@/types";
import { supabase } from "./supabase";
import * as SQLite from "expo-sqlite";

// when signup and import
export const updateLocalUserIdToUid = async (db: SQLite.SQLiteDatabase | null, userId: string | null) => {
  if (!db || !userId) return;
  try {
    await db.runAsync(`UPDATE entries SET user_id = ?;`, [userId]);
  } catch (e) {
    console.error(e);
  }
};

// when signout
export const updateLocalUserIdToNull = async (db: SQLite.SQLiteDatabase | null, userId: string | null) => {
  if (!db || userId) return;
  try {
    await db.runAsync(`UPDATE entries SET user_id = ?;`, [null]);
  } catch (e) {
    console.error(e);
  }
};

// when subscribe
export const syncAllLocalDataWithSupabase = async (db: SQLite.SQLiteDatabase | null) => {
  if (!db) return;
  // await db.runAsync(`UPDATE entries SET synced = ?;`, [0]);
  const allEntries: Entry[] = await db.getAllAsync("SELECT * FROM entries");
  for (const entry of allEntries) {
    const { error } = await supabase.from("entries").insert([entry]);
    if (error) console.error(error);
    // if (!error) {
    //   await db.runAsync(`UPDATE entries SET synced = ? WHERE id = ?`, [1, entry.id]);
    // } else {
    //   console.error(error);
    // }
  }
};

// when unsubscribe
export const unsyncAllLocalDataWithSupabase = async (
  db: SQLite.SQLiteDatabase | null,
  userId: string | null
) => {
  if (!db || !userId) return;
  // await db.runAsync(`UPDATE entries SET synced = ?;`, [0]);
  await supabase.from("entries").delete().eq("user_id", userId);
};

// when storeEntryByPaidUser
export const syncStoreEntry = async (db: SQLite.SQLiteDatabase | null, text: string) => {
  if (!db) return;
  const entry = await db.getFirstAsync("SELECT * FROM entries WHERE text = ?;", [text]);
  await supabase.from("entries").insert([entry]);
};

// when tap syncButton and open the app
export const syncAllDataFromSupabase = async (db: SQLite.SQLiteDatabase | null) => {
  if (!db) return;
  const latestLocalEntry: Entry | null = await db.getFirstAsync(
    "SELECT created_at FROM entries ORDER BY created_at DESC"
  );
  if (!latestLocalEntry) return;
  const latestCreatedAt = latestLocalEntry.created_at;
  const { data: newEntries } = await supabase.from("entries").select("*").gt("created_at", latestCreatedAt);
  if (!newEntries) return;
  const placeholders = newEntries.map(() => "(?,?,?,?,?,?)").join(",");
  const values = newEntries.reduce((acc, entry) => {
    return acc.concat([
      entry.created_at,
      entry.updated_at,
      entry.deleted_at,
      entry.date,
      entry.text,
      entry.user_id,
    ]);
  }, []);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO entries (created_at, updated_at, deleted_at, date, text, user_id) VALUES ${placeholders}`,
      values
    );
  });
};

// when edit  maybe need updated_at?
export const syncEditedData = async (db: SQLite.SQLiteDatabase | null) => {
  if (!db) return;
  const latestEditedEntry: Entry | null = await db.getFirstAsync(
    "SELECT updated_at FROM entries ORDER BY updated_at DESC"
  );
  if (!latestEditedEntry) return;
  const latestUpdatedAt = latestEditedEntry.updated_at;
  const { data: newEntries } = await supabase.from("entries").select("*").gt("updated_at", latestUpdatedAt);
  if (!newEntries) return;
  const placeholders = newEntries.map(() => "(?,?,?,?,?,?)").join(",");
  const values = newEntries.reduce((acc, entry) => {
    return acc.concat([
      entry.created_at,
      entry.updated_at,
      entry.deleted_at,
      entry.date,
      entry.text,
      entry.user_id,
    ]);
  }, []);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR REPLACE INTO entries (created_at, updated_at, deleted_at, date, text, user_id) VALUES ${placeholders}`,
      values
    );
  });
};

// when delete
export const syncDeletedData = async (db: SQLite.SQLiteDatabase | null) => {
  if (!db) return;
  const { data: deletedEntries } = await supabase
    .from("entries")
    .select("id, deleted_at")
    .not("deleted_at", "is", null);
};

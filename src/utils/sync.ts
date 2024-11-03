import { Entry } from "@/types";
import { supabase } from "./supabase";
import * as SQLite from "expo-sqlite";
import CryptoES from "crypto-es";
import { jsonFormatter } from "./encryption";

type OmittedEntry = Omit<Entry, "synced">;

export const updateLocalUserIdToUid = async (db: SQLite.SQLiteDatabase | null, userId: string | null) => {
  if (!db || !userId) return;
  try {
    await db.runAsync(`UPDATE entries SET user_id = ? WHERE user_id IS NULL OR user_id != ?;`, [userId, userId]);
  } catch (e) {
    console.error(e);
  }
};

export const updateUnsyncedLocalDataWithSupabase = async (db: SQLite.SQLiteDatabase | null, userId: string | null, decryptedMasterKey: string) => {
  if (!db || !userId) return;
  const unsyncedEntries: Entry[] = await db.getAllAsync("SELECT * FROM entries WHERE synced = 0");

  if (unsyncedEntries.length > 0) {
    for (const unsyncedEntry of unsyncedEntries) {
      const encryptedText: CryptoES.lib.CipherParams = CryptoES.AES.encrypt(unsyncedEntry.text, decryptedMasterKey, {
        format: jsonFormatter,
      });
      const formattedEncryptedText: string = jsonFormatter.stringify(encryptedText);

      const removeSyncedProperty = (entry: Entry) => {
        const { synced, ...rest } = entry;
        return rest;
      };

      const encryptedUnsyncedEntry: OmittedEntry = removeSyncedProperty({
        ...unsyncedEntry,
        text: formattedEncryptedText,
      });

      const { data, error } = await supabase.from("entries").select("updated_at").eq("id", unsyncedEntry.id);
      if (error) {
        console.error('supabase.from("entries").select("updated_at").eq("id", unsyncedEntry.id)', error);
        return;
      }
      if (data.length > 0) {
        data.map(async (entry) => {
          if (new Date(entry.updated_at) < new Date(unsyncedEntry.updated_at)) {
            await supabase.from("entries").upsert([encryptedUnsyncedEntry]);
          }
        });
      } else {
        const { error } = await supabase.from("entries").insert([encryptedUnsyncedEntry]);
        if (error) {
          console.error('supabase.from("entries").insert([encryptedUnsyncedEntry])', error);
        }
      }
    }
  } else {
    console.log("no unsynced entries");
  }
};

export const fetchSupabaseData = async (db: SQLite.SQLiteDatabase | null, userId: string | null, decryptedMasterKey: string) => {
  if (!db || !userId) return;
  const { data, error } = await supabase.from("entries").select("*").eq("user_id", userId);
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    for (const entry of data) {
      const decryptedText = CryptoES.AES.decrypt(entry.text, decryptedMasterKey, { format: jsonFormatter }).toString(CryptoES.enc.Utf8);
      const localEntry: Entry | null = await db.getFirstAsync(`SELECT * FROM entries WHERE id = ?`, [entry.id]);
      if (localEntry) {
        if (new Date(entry.updated_at) > new Date(localEntry.updated_at)) {
          await db.runAsync(`UPDATE entries SET text = ?, updated_at = ?, deleted_at = ?, synced = 1 WHERE id = ?`, [
            decryptedText,
            entry.updated_at,
            entry.deleted_at,
            entry.id,
          ]);
        } else if (new Date(entry.updated_at) < new Date(localEntry.updated_at)) {
          const encryptedText: CryptoES.lib.CipherParams = CryptoES.AES.encrypt(localEntry.text, decryptedMasterKey, { format: jsonFormatter });
          const formattedEncryptedText: string = jsonFormatter.stringify(encryptedText);
          await supabase
            .from("entries")
            .update({
              text: formattedEncryptedText,
              updated_at: localEntry.updated_at,
              deleted_at: localEntry.deleted_at,
            })
            .eq("id", localEntry.id);
        }
      } else {
        await db.runAsync(`INSERT INTO entries (id, text, date, created_at, updated_at, deleted_at, user_id, synced) VALUES (?,?,?,?,?,?,?,?)`, [
          entry.id,
          decryptedText,
          entry.date,
          entry.created_at,
          entry.updated_at,
          entry.deleted_at,
          entry.user_id,
          1,
        ]);
      }
    }
  }

  const deletedEntries: Entry[] = await db.getAllAsync(`SELECT id FROM entries WHERE deleted_at <= datetime('now', '-7 days')`);
  if (deletedEntries) {
    for (const entry of deletedEntries) {
      await db.runAsync(`DELETE FROM entries WHERE id = ?`, [entry.id]);
      await supabase.from("entries").delete().eq("id", entry.id);
    }
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
  await db.runAsync(`UPDATE entries SET synced = 0 WHERE synced != 0;`); // I don't know this line is needed
  const allEntries: Entry[] = await db.getAllAsync("SELECT * FROM entries");
  for (const entry of allEntries) {
    const { error } = await supabase.from("entries").insert([entry]);
    if (!error) {
      await db.runAsync(`UPDATE entries SET synced = 1 WHERE id = ?`, [entry.id]);
    } else {
      console.error(error);
    }
  }
};

// when unsubscribe
export const deleteAllSupabaseData = async (db: SQLite.SQLiteDatabase | null, userId: string | null) => {
  if (!db || !userId) return;
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
  const latestLocalEntry: Entry | null = await db.getFirstAsync("SELECT created_at FROM entries ORDER BY created_at DESC");
  if (!latestLocalEntry) return;
  const latestCreatedAt = latestLocalEntry.created_at;
  const { data: newEntries } = await supabase.from("entries").select("*").gt("created_at", latestCreatedAt);
  if (!newEntries) return;
  const placeholders = newEntries.map(() => "(?,?,?,?,?,?)").join(",");
  const values = newEntries.reduce((acc, entry) => {
    return acc.concat([entry.created_at, entry.updated_at, entry.deleted_at, entry.date, entry.text, entry.user_id]);
  }, []);

  await db.withTransactionAsync(async () => {
    await db.runAsync(`INSERT INTO entries (created_at, updated_at, deleted_at, date, text, user_id) VALUES ${placeholders}`, values);
  });
};

// when edit
export const syncEditedData = async (db: SQLite.SQLiteDatabase | null) => {
  if (!db) return;
  const latestEditedEntry: Entry | null = await db.getFirstAsync("SELECT updated_at FROM entries ORDER BY updated_at DESC");
  if (!latestEditedEntry) return;
  const latestUpdatedAt = latestEditedEntry.updated_at;
  const { data: newEntries } = await supabase.from("entries").select("*").gt("updated_at", latestUpdatedAt);
  if (!newEntries) return;
  const placeholders = newEntries.map(() => "(?,?,?,?,?,?)").join(",");
  const values = newEntries.reduce((acc, entry) => {
    return acc.concat([entry.created_at, entry.updated_at, entry.deleted_at, entry.date, entry.text, entry.user_id]);
  }, []);
  await db.withTransactionAsync(async () => {
    await db.runAsync(`INSERT OR REPLACE INTO entries (created_at, updated_at, deleted_at, date, text, user_id) VALUES ${placeholders}`, values);
  });
};

// when delete
export const syncDeletedData = async (db: SQLite.SQLiteDatabase | null) => {
  if (!db) return;
  const { data: deletedEntries } = await supabase.from("entries").select("id, deleted_at").not("deleted_at", "is", null);
};

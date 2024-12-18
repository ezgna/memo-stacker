import { Entry } from "@/types";
import { supabase } from "./supabase";
import * as SQLite from "expo-sqlite";
import CryptoES from "crypto-es";
import { jsonFormatter } from "./encryption";
import * as Crypto from "expo-crypto";

type OmittedEntry = Omit<Entry, "synced">;

export const updateLocalUserIdToUid = async (db: SQLite.SQLiteDatabase | null, userId: string | null) => {
  if (!db || !userId) return;
  try {
    await db.runAsync(`UPDATE entries SET user_id = ? WHERE user_id IS NULL OR user_id != ?;`, [userId, userId]);
  } catch (e) {
    console.error(e);
  }
};

export const updateUnsyncedLocalDataWithSupabase = async (db: SQLite.SQLiteDatabase | null, userId: string | null, masterKey: string) => {
  if (!db || !userId) return;
  const unsyncedEntries: Entry[] = await db.getAllAsync("SELECT * FROM entries WHERE synced = 0");

  if (unsyncedEntries.length > 0) {
    for (const unsyncedEntry of unsyncedEntries) {
      const encryptedText: CryptoES.lib.CipherParams = CryptoES.AES.encrypt(unsyncedEntry.text, masterKey, {
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
          if (error.message === 'duplicate key value violates unique constraint "entries_id_key"') {
            const oldId = encryptedUnsyncedEntry.id;
            const newId = Crypto.randomUUID();
            const reGeneratedIdEncryptedEntry = {
              ...encryptedUnsyncedEntry,
              id: newId,
            };
            const { error: reGenerateError } = await supabase.from("entries").insert([reGeneratedIdEncryptedEntry]);
            if (reGenerateError) {
              console.error(supabase.from("entries").insert([reGeneratedIdEncryptedEntry]), reGenerateError);
            } else {
              await db.runAsync("UPDATE entries SET id = ? WHERE id = ?", [newId, oldId]);
            }
          } else {
            console.error('supabase.from("entries").insert([encryptedUnsyncedEntry])', error);
          }
        }
      }
    }
  } else {
    console.log("no unsynced entries");
  }
};

export const fetchSupabaseData = async (db: SQLite.SQLiteDatabase | null, userId: string | null, masterKey: string) => {
  if (!db || !userId) return;
  const { data, error } = await supabase.from("entries").select("*").eq("user_id", userId);
  if (error) {
    console.error(supabase.from("entries").select("*").eq("user_id", userId), error);
    return;
  }
  if (data) {
    try {
      for (const entry of data) {
        const decryptedText = CryptoES.AES.decrypt(entry.text, masterKey, { format: jsonFormatter }).toString(CryptoES.enc.Utf8);
        if (!decryptedText) {
          console.error("decryption error");
          return;
        }
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
            const encryptedText: CryptoES.lib.CipherParams = CryptoES.AES.encrypt(localEntry.text, masterKey, { format: jsonFormatter });
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
    } catch (e) {
      console.error("fetchSupabaseDataError", e);
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

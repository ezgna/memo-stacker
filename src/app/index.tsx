import { Entry } from "@/types";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Toast from "react-native-root-toast";
import CancelEditButton from "../components/CancelEditButton";
import { FlashListCompo } from "../components/FlashListCompo";
import SaveButton from "../components/SaveButton";
import { useAuthContext } from "../contexts/AuthContext";
import { useDataContext } from "../contexts/DataContext";
import { useDatabase } from "../hooks/useDatabase";
import { supabase } from "../utils/supabase";

export default function index() {
  const db = useDatabase();
  const [text, setText] = useState<string>("");
  const { session } = useAuthContext();
  const userId = session?.user.id || null;
  const { dataUpdated, setDataUpdated, searchQuery } = useDataContext();
  const [fetchedEntries, setFetchedEntries] = useState<Entry[]>([]);

  // synced INTEGER DEFAULT 0
  const createTable = async () => {
    if (!db) return;
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS entries (
          id INTEGER PRIMARY KEY,
          created_at TEXT,
          updated_at TEXT,
          deleted_at TEXT,
          date TEXT,
          text TEXT,
          user_id TEXT DEFAULT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_date ON entries (date);
      `);
    } catch (e) {
      console.error(e);
    }
  };

  // const updateUserId = async () => {
  //   if (!db || !userId) return;
  //   try {
  //     await db.runAsync(`UPDATE entries SET user_id = ? WHERE user_id IS NULL;`, [userId]);
  //     await supabase.from('entries').update({user_id: userId}).is('user_id', null);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // const syncLocalDataWithSupabase = async () => {
  //   if (!db) return;
  //   const unsyncedEntries: Entry[] = await db.getAllAsync(`SELECT * FROM entries WHERE synced = 0`);
  //   if (!unsyncedEntries.length) return
  //   for (const entry of unsyncedEntries) {
  //     const { error } = await supabase.from("entries").insert([entry]);
  //     if (!error) {
  //       await db.runAsync(`UPDATE entries SET synced = 1 WHERE id = ?`, [entry.id]);
  //     } else {
  //       console.error(error);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   syncLocalDataWithSupabase();
  // }, [db]);

  const storeEntry = async (text: string) => {
    if (!db) return;
    if (!text.trim()) {
      setText("");
      Toast.show("Content cannot be empty");
      return;
    }
    const currentDate = new Date()
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-")
      .split(" ")[0];
    const data = {
      created_at: new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      updated_at: new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      deleted_at: null,
      date: currentDate,
      text: text.trim(),
      user_id: userId,
    };
    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO entries (created_at, updated_at, deleted_at, date, text, user_id) VALUES (?,?,?,?,?,?)`,
          [data.created_at, data.updated_at, data.deleted_at, data.date, data.text, data.user_id]
        );
      });

      setText("");
      setDataUpdated(!dataUpdated);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEntry = async (id: number) => {
    if (!db) return;
    try {
      const deletedAt = new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      // await db.runAsync(`DELETE FROM entries WHERE id = ?`, [id]);
      await db.runAsync("UPDATE entries SET deleted_at = ? WHERE id = ?", [deletedAt, id]);
      setDataUpdated(!dataUpdated);
    } catch (e) {
      console.error(e);
    }
  };

  const [editingText, setEditingText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleEdit = (text: string, id: number) => {
    setEditingId(id);
    setEditingText(text);
  };

  const updateEntry = async () => {
    if (!db) return;
    if (!editingText.trim()) {
      Toast.show("Content cannot be empty");
      return;
    }
    try {
      const updateAt = new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const trimmedEditingText = editingText.trim();
      await db.runAsync(`UPDATE entries SET text = ?, updated_at = ? WHERE id = ?`, [
        trimmedEditingText,
        updateAt,
        editingId,
      ]);
      setEditingId(null);
      setEditingText("");
      setDataUpdated(!dataUpdated);
    } catch (e) {
      console.error(e);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  useEffect(() => {
    createTable();
  }, [db]);

  // useEffect(() => {
  //   updateUserId();
  // }, [userId]);

  // const inputRef = useRef<TextInput>(null);

  // useEffect(() => {
  //   if (inputRef.current) {
  //     inputRef.current.focus();
  //   }
  // }, []);

  useEffect(() => {
    if (!db) return;
    const fetchAllEntries = async () => {
      try {
        const entries: Entry[] = await db.getAllAsync(
          "SELECT * FROM entries WHERE deleted_at IS NULL ORDER BY created_at DESC"
        );
        setFetchedEntries(entries);
        if (searchQuery) {
          const searchedEntries = entries.filter((entry) =>
            entry.text?.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFetchedEntries(searchedEntries);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAllEntries();
  }, [db, dataUpdated, searchQuery]);

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          style={styles.input}
          // ref={inputRef}
          onChangeText={editingId ? setEditingText : setText}
          value={editingId ? editingText : text}
          multiline
        />
        <View>
          {editingId ? <CancelEditButton onPress={() => cancelEdit()} /> : null}
          <SaveButton
            onPress={editingId ? () => updateEntry() : () => storeEntry(text)}
            editingId={editingId}
          />
        </View>
      </View>
      <FlashListCompo
        data={fetchedEntries}
        onDelete={deleteEntry}
        onUpdate={handleEdit}
        editingId={editingId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "gainsboro",
    borderRadius: 5,
    marginVertical: 10,
    fontSize: 18,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 45,
  },
});

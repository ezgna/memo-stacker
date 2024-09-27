import { Entry } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Toast from "react-native-root-toast";
import { useDatabase } from "../hooks/useDatabase";
import CancelEditButton from "./components/CancelEditButton";
import { useDataContext } from "./components/DataContext";
import { FlashListCompo } from "./components/FlashListCompo";
import SaveButton from "./components/SaveButton";

export default function index() {
  const db = useDatabase();
  const [text, setText] = useState<string>("");
  const { dataUpdated, setDataUpdated, searchQuery } = useDataContext();
  const [fetchedEntries, setFetchedEntries] = useState<Entry[]>([]);

  const createTable = async () => {
    if (!db) return;
    try {
      // changes to id INTEGER PRIMARY KEY,
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT,
          date TEXT,
          text TEXT,
          user_id TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_date ON entries (date);
      `);
    } catch (e) {
      console.error(e);
    }
  };

  const storeEntry = async (text: string) => {
    if (!db) return;
    if (!text.trim()) {
      setText("");
      Toast.show("Content cannot be empty");
      return;
    }
    const currentDate = new Date()
      .toLocaleString("ja-JP", { //changes to toLocaleDateString()
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
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
      date: currentDate,
      text: text.trim(),
      user_id: "user_id",
    };
    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(`INSERT INTO entries (created_at, date, text, user_id) VALUES (?, ?, ?, ?)`, [
          data.created_at,
          data.date,
          data.text,
          data.user_id,
        ]);
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
      await db.runAsync(`DELETE FROM entries WHERE id = ?`, [id]);
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
    try {
      await db.runAsync(`UPDATE entries SET text = ? WHERE id = ?`, [editingText, editingId]);
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

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    const fetchAllEntries = async () => {
      try {
        const entries: Entry[] = await db.getAllAsync("SELECT * FROM entries ORDER BY created_at DESC");
        setFetchedEntries(entries);
        if (searchQuery) {
          const searchedEntries = entries.filter((entry) =>
            entry.text.toLowerCase().includes(searchQuery.toLowerCase())
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
          ref={inputRef}
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
      <FlashListCompo data={fetchedEntries} onDelete={deleteEntry} onUpdate={handleEdit} />
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

import CancelEditButton from "@/src/components/CancelEditButton";
import { FlashListCompo } from "@/src/components/FlashListCompo";
import SaveButton from "@/src/components/SaveButton";
import { useDataContext } from "@/src/contexts/DataContext";
import { useFontContext } from "@/src/contexts/FontContext";
import { useSettingsContext } from "@/src/contexts/SettingsContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { db, initDatabase } from "@/src/database/db";
import { runMigrations } from "@/src/database/migrations";
import { Entry } from "@/src/database/types";
import i18n from "@/src/utils/i18n";
import { getStep, setStep } from "@/src/utils/onboarding";
import { themeColors } from "@/src/utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";
import Toast from "react-native-root-toast";
import mobileAds from "react-native-google-mobile-ads";

export default function index() {
  const [text, setText] = useState<string>("");
  const { dataUpdated, setDataUpdated, searchQuery } = useDataContext();
  const [fetchedEntries, setFetchedEntries] = useState<Entry[]>([]);
  const { theme } = useThemeContext();
  const [isAdsRemoved, setIsAdsRemoved] = useState(false);
  const { fontFamilyStyle } = useFontContext();

  // useEffect(() => {
  //   const debugTables = async () => {
  //     if (__DEV__) {
  // const allTables = await db!.getAllAsync(`SELECT name FROM sqlite_master WHERE type='table'`);
  // console.log("Current tables:", allTables);
  // const columns = (await db!.getAllAsync(`PRAGMA table_info(entries)`)) as { name: string }[];
  // const columnNames = columns.map((col) => col.name);
  // console.log("Column names in 'entries':", columnNames);
  //     }
  //   };
  //   debugTables();
  // }, []);

  useEffect(() => {
    (async () => {
      const s = await getStep();
      if (s === 0) {
        const title = i18n.t("onboarding.step1.title");
        const lines = i18n.t("onboarding.step1.description", { returnObjects: true }) as string[];
        const message = lines.join("\n");
        setTimeout(() => {
          Alert.alert(
            title,
            message,
            [
              {
                text: "OK",
                onPress: async () => {
                  await setStep(1);
                },
              },
            ],
            { cancelable: false }
          );
        }, 500);
      }
    })();
  }, []);

  useEffect(() => {
    const checkAdsStatus = async () => {
      const value = await AsyncStorage.getItem("isAdsRemoved");
      if (value === "true") {
        setIsAdsRemoved(true);
      }
    };
    checkAdsStatus();
  }, []);

  const storeEntry = async (text: string) => {
    if (!db) return;
    if (!text.trim()) {
      setText("");
      Toast.show(i18n.t("content_cannot_be_empty"), {
        position: Toast.positions.CENTER,
      });
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

    const data = {
      id: Crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      date: formattedDate,
      text: text.trim(),
    };
    try {
      await db.withTransactionAsync(async () => {
        await db!.runAsync(`INSERT INTO entries (id, created_at, updated_at, deleted_at, date, text) VALUES (?,?,?,?,?,?)`, [
          data.id,
          data.created_at,
          data.updated_at,
          data.deleted_at,
          data.date,
          data.text,
        ]);
      });

      setText("");
      setDataUpdated(!dataUpdated);

      const s = await getStep();
      if (s === 1) {
        const title = i18n.t("onboarding.step2.title");
        const lines = i18n.t("onboarding.step2.description", { returnObjects: true }) as string[];
        const message = lines.join("\n");
        setTimeout(() => {
          Alert.alert(
            title,
            message,
            [
              {
                text: "OK",
                onPress: async () => {
                  await setStep(2);
                },
              },
            ],
            { cancelable: false }
          );
        }, 500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!db) return;
    try {
      const confirmed = await new Promise((resolve) => {
        Alert.alert(i18n.t("confirm_deletion"), i18n.t("delete_entry_message"), [
          {
            text: i18n.t("cancel"),
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: i18n.t("delete"),
            style: "destructive",
            onPress: () => resolve(true),
          },
        ]);
      });
      if (!confirmed) return;
      const updateAt = new Date().toISOString();
      const deletedAt = new Date().toISOString();
      await db.runAsync("UPDATE entries SET updated_at = ?, deleted_at = ? WHERE id = ?", [updateAt, deletedAt, id]);
      setDataUpdated(!dataUpdated);
    } catch (e) {
      console.error(e);
    }
  };

  const [editingText, setEditingText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (text: string, id: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const updateEntry = async () => {
    if (!db) return;
    if (!editingText.trim()) {
      Toast.show(i18n.t("content_cannot_be_empty"), {
        position: Toast.positions.CENTER,
      });
      return;
    }
    try {
      const updateAt = new Date().toISOString();
      const trimmedEditingText = editingText.trim();
      await db.runAsync(`UPDATE entries SET text = ?, updated_at = ? WHERE id = ?`, [trimmedEditingText, updateAt, editingId]);
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
    (async () => {
      await initDatabase();
      await runMigrations();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!db) return;
      const deletedEntries: Entry[] = await db.getAllAsync(`SELECT id FROM entries WHERE deleted_at <= datetime('now', '-7 days')`);
      if (deletedEntries) {
        for (const entry of deletedEntries) {
          await db.runAsync(`DELETE FROM entries WHERE id = ?`, [entry.id]);
        }
      }
    })();
  }, [db]);

  const inputRef = useRef<TextInput>(null);
  const { autoFocus } = useSettingsContext();

  useEffect(() => {
    if (inputRef.current && autoFocus) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!db) return;
    const fetchAllEntries = async () => {
      try {
        const entries: Entry[] = await db!.getAllAsync("SELECT * FROM entries WHERE deleted_at IS NULL ORDER BY created_at DESC");
        setFetchedEntries(entries);
        // console.log(entries)
        if (searchQuery) {
          const searchedEntries = entries.filter((entry) => entry.text?.toLowerCase().includes(searchQuery.toLowerCase()));
          setFetchedEntries(searchedEntries);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAllEntries();
  }, [db, dataUpdated, searchQuery]);

  const adInspector = async () => {
    await mobileAds().openAdInspector();
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }]}>
        {/* <ResetDatabase /> */}
        <Button title="inspect ads" onPress={adInspector} />
        <View>
          <TextInput
            style={[
              styles.input,
              fontFamilyStyle,
              {
                color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
                borderColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border,
              },
            ]}
            ref={inputRef}
            onChangeText={editingId ? setEditingText : setText}
            value={editingId ? editingText : text}
            multiline
          />
          <View>
            {editingId ? <CancelEditButton onPress={() => cancelEdit()} /> : null}
            <SaveButton onPress={editingId ? () => updateEntry() : () => storeEntry(text)} editingId={editingId} />
          </View>
        </View>
        <FlashListCompo data={fetchedEntries} onDelete={deleteEntry} onUpdate={handleEdit} editingId={editingId} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    fontSize: 18,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 45,
  },
});

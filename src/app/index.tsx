import { Entry } from "@/types";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, Platform, StyleSheet, TextInput, View } from "react-native";
import mobileAds, { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import Toast from "react-native-root-toast";
import CancelEditButton from "../components/CancelEditButton";
import { FlashListCompo } from "../components/FlashListCompo";
import SaveButton from "../components/SaveButton";
import { useAuthContext } from "../contexts/AuthContext";
import { useDataContext } from "../contexts/DataContext";
import { useSettingsContext } from "../contexts/SettingsContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { useDatabase } from "../hooks/useDatabase";
import { generateKeyFromUserId } from "../utils/encryption";
import i18n from "../utils/i18n";
import { fetchSupabaseData, updateLocalUserIdToUid, updateUnsyncedLocalDataWithSupabase } from "../utils/sync";
import { themeColors } from "../utils/theme";

export default function index() {
  const db = useDatabase();
  const [text, setText] = useState<string>("");
  const { session, isOnline, isProUser } = useAuthContext();
  const userId = session?.user.id || null;
  const { dataUpdated, setDataUpdated, searchQuery } = useDataContext();
  const [fetchedEntries, setFetchedEntries] = useState<Entry[]>([]);
  const { theme } = useThemeContext();

  const createTable = async () => {
    if (!db) return;
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS entries (
          id TEXT PRIMARY KEY,
          created_at TEXT,
          updated_at TEXT,
          deleted_at TEXT,
          date TEXT,
          text TEXT,
          user_id TEXT,
          synced INTEGER DEFAULT 0
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
      Toast.show(i18n.t("content_cannot_be_empty"), {
        position: Toast.positions.CENTER,
      });
      return;
    }
    const localizedDateString = new Date().toLocaleDateString().replace(/\//g, "-");
    const data = {
      id: Crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      date: localizedDateString,
      text: text.trim(),
      user_id: userId,
    };
    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(`INSERT INTO entries (id, created_at, updated_at, deleted_at, date, text, user_id) VALUES (?,?,?,?,?,?,?)`, [
          data.id,
          data.created_at,
          data.updated_at,
          data.deleted_at,
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

  const deleteEntry = async (id: string) => {
    if (!db) return;
    try {
      if (!isProUser) {
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
      }
      const updateAt = new Date().toISOString();
      const deletedAt = new Date().toISOString();
      await db.runAsync("UPDATE entries SET updated_at = ?, deleted_at = ?, synced = 0 WHERE id = ?", [updateAt, deletedAt, id]);
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
      await db.runAsync(`UPDATE entries SET text = ?, updated_at = ?, synced = 0 WHERE id = ?`, [trimmedEditingText, updateAt, editingId]);
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
    (async () => {
      if (!isProUser) {
        if (!db) return;
        const deletedEntries: Entry[] = await db.getAllAsync(`SELECT id FROM entries WHERE deleted_at <= datetime('now', '-7 days')`);
        if (deletedEntries) {
          for (const entry of deletedEntries) {
            await db.runAsync(`DELETE FROM entries WHERE id = ?`, [entry.id]);
          }
        }
      }
    })();
  }, [db]);

  useEffect(() => {
    updateLocalUserIdToUid(db, userId);
  }, [db, userId]);

  useEffect(() => {
    // Check isOnline if it will automatically change when network state change
    const sync = async () => {
      if (isOnline && isProUser && userId) {
        try {
          // const { data, error } = await supabase.from("users").select("master_key").eq("user_id", userId);
          // if (error) {
          //   console.error('supabase.from("users").select("master_key").eq("user_id", userId)', error);
          // }
          // if (!(data && data.length > 0)) return;
          // const { master_key: encryptedMasterKey } = data[0];
          // const password = await SecureStore.getItemAsync("password");
          // if (!password) return;
          const kek = Constants.expoConfig?.extra?.KEY_WRAPPER;
          if (!kek) {
            console.log("kek not exist");
          }
          const masterKey = generateKeyFromUserId(userId, kek);

          // const decryptedMasterKey: string = CryptoES.AES.decrypt(encryptedMasterKey, kek, {
          //   format: jsonFormatter,
          // }).toString(CryptoES.enc.Utf8);
          await updateUnsyncedLocalDataWithSupabase(db, userId, masterKey);
          await fetchSupabaseData(db, userId, masterKey);
        } catch (e) {
          console.error("syncError", e);
        }
      }
    };
    sync();
  }, [db, userId, isOnline, isProUser]);

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
        const entries: Entry[] = await db.getAllAsync("SELECT * FROM entries WHERE deleted_at IS NULL ORDER BY created_at DESC");
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

  const [isAppActive, setIsAppActive] = useState(AppState.currentState === "active");
  const [nonPersonalized, setNonPersonalized] = useState(true);
  const [adsInitialized, setAdsInitialized] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setIsAppActive(true);
      } else {
        setIsAppActive(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       if (!isAppActive || Platform.OS === "android") return;
  //       const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
  //       switch (result) {
  //         case RESULTS.GRANTED:
  //           setNonPersonalized(false);
  //           break;
  //         case RESULTS.DENIED:
  //           const requestResult = await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
  //           setNonPersonalized(requestResult !== RESULTS.GRANTED);
  //           break;
  //         case RESULTS.BLOCKED:
  //           setNonPersonalized(true);
  //           break;
  //         default:
  //           break;
  //       }
  //       if (!adsInitialized) {
  //         await mobileAds().initialize();
  //         setAdsInitialized(true);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   })();
  // }, [isAppActive]);

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }]}>
        {/* <ResetDatabase /> */}
        <View>
          <TextInput
            style={[
              styles.input,
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
      {!isProUser && Platform.OS !== "android" && (
        <View>
          {Constants.expoConfig?.extra?.APP_ENV === "development" ? (
            <BannerAd unitId={TestIds.ADAPTIVE_BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
          ) : (
            <BannerAd
              unitId="ca-app-pub-4363360791941587/8952562876"
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: nonPersonalized }}
            />
          )}
        </View>
      )}
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

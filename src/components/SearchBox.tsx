import i18n, { isJapanese } from "@/src/utils/i18n";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useAuthContext } from "../contexts/AuthContext";
import { useDataContext } from "../contexts/DataContext";
import { useDatabase } from "../hooks/useDatabase";
import { fetchSupabaseData, updateUnsyncedLocalDataWithSupabase } from "../utils/sync";
import { supabase } from "../utils/supabase";
import * as SecureStore from "expo-secure-store";
import CryptoES from "crypto-es";
import { jsonFormatter } from "../utils/encryption";
import { themeColors } from "../utils/theme";
import { useThemeContext } from "../contexts/ThemeContext";

export default function SearchBox() {
  const { searchQuery, setSearchQuery } = useDataContext();
  const { session, isOnline, isProUser } = useAuthContext();
  const userId = session?.user.id || null;
  const { theme } = useThemeContext();
  const db = useDatabase();

  const handleSync = async () => {
    if (isOnline && isProUser) {
      try {
        const { data, error } = await supabase.from("users").select("master_key").eq("user_id", userId);
        if (error) {
          console.error(error);
        }
        if (!(data && data.length > 0)) return;
        const { master_key: encryptedMasterKey } = data[0];
        const password = await SecureStore.getItemAsync("password");
        if (!password) {
          console.log("password not exist");
          return;
        }
        const decryptedMasterKey: string = CryptoES.AES.decrypt(encryptedMasterKey, password, {
          format: jsonFormatter,
        }).toString(CryptoES.enc.Utf8);
        await updateUnsyncedLocalDataWithSupabase(db, userId, decryptedMasterKey);
        await fetchSupabaseData(db, userId, decryptedMasterKey);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <View style={styles.container}>
      {isProUser && (
        <TouchableOpacity style={{ marginRight: 100 }} onPress={() => handleSync()} disabled={!isOnline}>
          <MaterialIcons name="sync" size={20} color={isOnline ? "gray" : "lightgray"} />
        </TouchableOpacity>
      )}
      <View style={[styles.inputContainer, { backgroundColor: theme === "dark" ? themeColors.dark.background : "gainsboro" }]}>
        <FontAwesome name="search" size={16} color={theme === "dark" ? "darkgray" : "gray"} />
        <TextInput
          style={isJapanese ? [styles.textInput, { fontFamily: "NotoSansJP" }] : styles.textInput}
          placeholder={i18n.t("search")}
          placeholderTextColor={theme === "dark" ? "gray" : "darkgray"}
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    borderRadius: 3,
    flexDirection: "row",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 7,
    borderRadius: 3,
    height: "70%",
    width: "100%",
    marginRight: 10,
  },
  textInput: {
    height: "100%",
    paddingLeft: 7,
    marginRight: 7,
    flex: 1,
  },
});

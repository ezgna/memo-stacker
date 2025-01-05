import i18n from "@/src/utils/i18n";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Constants from "expo-constants";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useAuthContext } from "../contexts/AuthContext";
import { useDataContext } from "../contexts/DataContext";
import { useLanguageContext } from "../contexts/LanguageContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { useDatabase } from "../hooks/useDatabase";
import { generateKeyFromUserId } from "../utils/encryption";
import { fetchSupabaseData, updateUnsyncedLocalDataWithSupabase } from "../utils/sync";
import { themeColors } from "../utils/theme";

export default function SearchBox() {
  const { searchQuery, setSearchQuery } = useDataContext();
  const { session, isOnline, isProUser } = useAuthContext();
  const userId = session?.user.id || null;
  const { theme } = useThemeContext();
  const db = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
    const { isJapanese } = useLanguageContext();
  

  const handleSync = async () => {
    if (isOnline && isProUser) {
      setIsLoading(true);
      try {
        // const { data, error } = await supabase.from("users").select("master_key").eq("user_id", userId);
        // if (error) {
        //   console.error('supabase.from("users").select("master_key").eq("user_id", userId)', error);
        // }
        // if (!(data && data.length > 0)) {
        //   console.log("no data exist");
        //   return;
        // }
        // const { master_key: encryptedMasterKey } = data[0];
        // const password = await SecureStore.getItemAsync("password");
        // if (!password) {
        //   console.log("password not exist");
        //   return;
        // }
        const kek = Constants.expoConfig?.extra?.KEY_WRAPPER;
        if (!kek || !userId) {
          console.error('kek or userId not exist')
          return
        }
        const masterKey = generateKeyFromUserId(userId, kek)
        // const decryptedMasterKey: string = CryptoES.AES.decrypt(encryptedMasterKey, kek, {
        //   format: jsonFormatter,
        // }).toString(CryptoES.enc.Utf8);
        await updateUnsyncedLocalDataWithSupabase(db, userId, masterKey);
        await fetchSupabaseData(db, userId, masterKey);
      } catch (e) {
        console.error("handleSync try catch error", e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {isProUser && (
        <View style={{ marginRight: 100 }}>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <TouchableOpacity onPress={() => handleSync()} disabled={!isOnline}>
              <MaterialIcons name="sync" size={20} color={isOnline ? "gray" : "lightgray"} />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={[styles.inputContainer, { backgroundColor: theme === "dark" ? themeColors.dark.background : "gainsboro" }]}>
        <FontAwesome name="search" size={16} color={theme === "dark" ? "darkgray" : "gray"} />
        <TextInput
          style={[
            styles.textInput,
            isJapanese && { fontFamily: "NotoSansJP" },
            { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText },
          ]}
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

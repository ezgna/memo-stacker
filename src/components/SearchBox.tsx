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
import { decryptMasterKey } from "../utils/encryption";

export default function SearchBox() {
  const { searchQuery, setSearchQuery } = useDataContext();
  const { session, isOnline, isProUser } = useAuthContext();
  const userId = session?.user.id || null;
  const db = useDatabase();

  const handleSync = async () => {
    if (isOnline && isProUser) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("encrypted_master_key, iv")
          .eq("user_id", userId);
        if (error) {
          console.error(error);
        }
        if (!(data && data.length > 0)) {
          console.log('data not exist')
          return;
        }
        const { encrypted_master_key: encryptedMasterKey, iv } = data[0];
        console.log('1')
        const password = await SecureStore.getItemAsync("password");
        console.log('2')
        if (!password) {
          console.log('password not exist')
          return;
        }
        const decryptedMasterKey: string = decryptMasterKey(encryptedMasterKey, password, iv);
        console.log(3)
        await updateUnsyncedLocalDataWithSupabase(db, userId, decryptedMasterKey);
        console.log(4)
        await fetchSupabaseData(db, userId, decryptedMasterKey);
        console.log(5)
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
      <View style={styles.inputContainer}>
        <FontAwesome name="search" size={16} color="grey" />
        <TextInput
          style={isJapanese ? [styles.textInput, { fontFamily: "NotoSansJP" }] : styles.textInput}
          placeholder={i18n.t("search")}
          placeholderTextColor="silver"
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
    backgroundColor: "gainsboro",
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

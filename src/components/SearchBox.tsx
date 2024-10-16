import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useDataContext } from "../contexts/DataContext";
import i18n, { isJapanese } from "@/src/utils/i18n";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useAuthContext } from "../contexts/AuthContext";
import { fetchSupabaseData, updateUnsyncedLocalDataWithSupabase } from "../utils/sync";
import { useDatabase } from "../hooks/useDatabase";

export default function SearchBox() {
  const { searchQuery, setSearchQuery } = useDataContext();
  const { session, isOnline, isProUser } = useAuthContext();
  const userId = session?.user.id || null;
  const db = useDatabase();

  const handleSync = async () => {
    if (isOnline && isProUser) {
      try {
        await updateUnsyncedLocalDataWithSupabase(db, userId);
        await fetchSupabaseData(db, userId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <View style={styles.container}>
      {isProUser && (
        <TouchableOpacity style={{ marginRight: 100 }} onPress={() => handleSync()} disabled={!isOnline}>
          <MaterialIcons name="sync" size={20} color= {isOnline ? "gray" : 'lightgray'} />
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

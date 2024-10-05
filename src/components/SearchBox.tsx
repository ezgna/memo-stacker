import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useDataContext } from "../contexts/DataContext";
import i18n, { isJapanese } from "@/src/utils/i18n";

export default function SearchBox() {
  const { searchQuery, setSearchQuery } = useDataContext();
  return (
    <View style={styles.container}>
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

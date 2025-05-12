import i18n from "@/src/utils/i18n";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Constants from "expo-constants";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View, TextInput } from "react-native";
import { useDataContext } from "../contexts/DataContext";
import { useLanguageContext } from "../contexts/LanguageContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { themeColors } from "../utils/theme";

export default function SearchBox() {
  const { searchQuery, setSearchQuery } = useDataContext();
  const { theme } = useThemeContext();
  const [isLoading, setIsLoading] = useState(false);
  const { isJapanese } = useLanguageContext();

  return (
    <View style={styles.container}>
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
    alignItems: "center",
    borderRadius: 3,
    flexDirection: "row",
    height: 40
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
    paddingLeft: 7,
    marginRight: 7,
    flex: 1,
  },
});
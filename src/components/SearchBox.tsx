import i18n from "@/src/utils/i18n";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { useDataContext } from "../contexts/DataContext";
import { useLanguageContext } from "../contexts/LanguageContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { themeColors } from "../utils/theme";
import { useFontContext } from "../contexts/FontContext";

export default function SearchBox() {
  const { searchQuery, setSearchQuery } = useDataContext();
  const { theme } = useThemeContext();
  const { isJapanese } = useLanguageContext();
  const { fontFamilyStyle } = useFontContext();

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { backgroundColor: theme === "dark" ? themeColors.dark.background : "gainsboro" }]}>
        <FontAwesome
          name="search"
          size={16}
          color={theme === "dark" ? "darkgray" : "gray"}
          // style={{ paddingBottom: 3 }}
        />
        <TextInput
          style={[styles.textInput, isJapanese && fontFamilyStyle, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}
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
    // borderRadius: 3,
    flexDirection: "row",
    // height: 40,
    maxWidth: Platform.OS === "ios" ? undefined : 200,
    marginRight: Platform.OS === "ios" ? undefined : 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: Platform.OS === "ios" ? 7 : 11,
    borderRadius: 3,
    height: Platform.OS === "ios" ? 28 : 42,
    width: "100%",
    marginRight: 10,
  },
  textInput: {
    paddingLeft: 7,
    marginRight: 20,
    includeFontPadding: Platform.OS === "ios" ? undefined : false,
    fontSize: Platform.OS === "ios" ? undefined : 16,
    height: "100%",
  },
});

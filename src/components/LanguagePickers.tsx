import { useThemeContext } from "@/src/contexts/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Platform, View } from "react-native";
import { useLanguageContext } from "../contexts/LanguageContext";
import { themeColors } from "../utils/theme";

const LanguagePickers = () => {
  const { selectedLanguage, toggleLanguage } = useLanguageContext();
  const { theme } = useThemeContext();
  const getPickerTextColor = () => {
    if (Platform.OS === "android") return themeColors.light.primaryText;
    return theme === "dark" ? "white" : "black";
  };

  return (
    <View>
      <Picker
        selectedValue={selectedLanguage}
        onValueChange={(value) => toggleLanguage(value)}
        dropdownIconColor={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText}
        style={{ color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }} // Only affects Android
      >
        <Picker.Item label="Match Device" value="system" color={getPickerTextColor()} />
        <Picker.Item label="Japanese" value="ja" color={getPickerTextColor()} />
        <Picker.Item label="English" value="en" color={getPickerTextColor()} />
      </Picker>
    </View>
  );
};

export default LanguagePickers;

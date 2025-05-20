import { useThemeContext } from "@/src/contexts/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Platform, View } from "react-native";
import { themeColors } from "../utils/theme";

const AppearancePickers = () => {
  const { theme, selectedTheme, toggleTheme } = useThemeContext();
  const getPickerTextColor = () => {
    if (Platform.OS === "android") return themeColors.light.primaryText;
    return theme === "dark" ? "white" : "black";
  };

  return (
    <View>
      <Picker
        selectedValue={selectedTheme}
        onValueChange={(value) => toggleTheme(value)}
        dropdownIconColor={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText}
        style={{ color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }} // Only affects Android
      >
        <Picker.Item label="Match Device" value="system" color={getPickerTextColor()} />
        <Picker.Item label="Light Theme" value="light" color={getPickerTextColor()} />
        <Picker.Item label="Dark Theme" value="dark" color={getPickerTextColor()} />
      </Picker>
    </View>
  );
};

export default AppearancePickers;

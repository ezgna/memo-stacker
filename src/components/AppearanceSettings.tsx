import { View, Text } from "react-native";
import React from "react";
import { Picker } from "@react-native-picker/picker";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { themeColors } from "../utils/theme";

const AppearanceSettings = () => {
  const { theme, selectedTheme, toggleTheme } = useThemeContext();

  return (
    <View>
      <Picker selectedValue={selectedTheme} onValueChange={(value) => toggleTheme(value)}>
        <Picker.Item label="Match Device" value="system" color={theme === "dark" ? "white" : undefined} />
        <Picker.Item label="Dark Theme" value="dark" color={theme === "dark" ? "white" : undefined} />
        <Picker.Item label="Light Theme" value="light" color={theme === "dark" ? "white" : undefined} />
      </Picker>
    </View>
  );
};

export default AppearanceSettings;

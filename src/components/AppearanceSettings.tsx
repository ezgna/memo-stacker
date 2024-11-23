import { useThemeContext } from "@/src/contexts/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { View } from "react-native";

const AppearanceSettings = () => {
  const { theme, selectedTheme, toggleTheme } = useThemeContext();

  return (
    <View>
      <Picker selectedValue={selectedTheme} onValueChange={(value) => toggleTheme(value)}>
        <Picker.Item label="Match Device" value="system" color={theme === "dark" ? "white" : undefined} />
        <Picker.Item label="Light Theme" value="light" color={theme === "dark" ? "white" : undefined} />
        <Picker.Item label="Dark Theme" value="dark" color={theme === "dark" ? "white" : undefined} />
      </Picker>
    </View>
  );
};

export default AppearanceSettings;

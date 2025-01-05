import { useThemeContext } from "@/src/contexts/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect } from "react";
import { View } from "react-native";
import { useLanguageContext } from "../contexts/LanguageContext";

const LanguagePickers = () => {
  const { selectedLanguage, toggleLanguage } = useLanguageContext();
  const { theme } = useThemeContext();

  return (
    <View>
      <Picker selectedValue={selectedLanguage} onValueChange={(value) => toggleLanguage(value)}>
        <Picker.Item label="Match Device" value="system" color={theme === "dark" ? "white" : undefined} />
        <Picker.Item label="Japanese" value="ja" color={theme === "dark" ? "white" : undefined} />
        <Picker.Item label="English" value="en" color={theme === "dark" ? "white" : undefined} />
      </Picker>
    </View>
  );
};

export default LanguagePickers;

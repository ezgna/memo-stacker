import { useThemeContext } from "@/src/contexts/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Platform, View } from "react-native";
import { themeColors } from "../utils/theme";
import { useFontContext } from "../contexts/FontContext";
import i18n from "../utils/i18n";

const FontPickers = () => {
  const { theme } = useThemeContext();
  const { font, setFont } = useFontContext();

  const getPickerTextColor = () => {
    if (Platform.OS === "android") return themeColors.light.primaryText;
    return theme === "dark" ? "white" : "black";
  };

  return (
    <View>
      <Picker
        selectedValue={font}
        onValueChange={(value) => setFont(value)}
        dropdownIconColor={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText}
        style={{ color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }} // Only affects Android
      >
        <Picker.Item label={i18n.t("default")} value="default" color={getPickerTextColor()} />
        <Picker.Item label={i18n.t("zenMaru")} value="zenmaru" color={getPickerTextColor()} />
        <Picker.Item label={i18n.t("zenOld")} value="zenold" color={getPickerTextColor()} />
        <Picker.Item label={i18n.t("rocknRoll")} value="rocknroll" color={getPickerTextColor()} />
        <Picker.Item label={i18n.t("mplus1p")} value="mplus1p" color={getPickerTextColor()} />
      </Picker>
    </View>
  );
};

export default FontPickers;

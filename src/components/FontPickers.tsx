import { useThemeContext } from "@/src/contexts/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Platform, View } from "react-native";
import { themeColors } from "../utils/theme";
import { useFontContext } from "../contexts/FontContext";

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
        <Picker.Item label="ZEN丸ゴシック" value="zenmaru" color={getPickerTextColor()} />
        <Picker.Item label="ZENオールド明朝" value="zenold" color={getPickerTextColor()} />
        <Picker.Item label="ロックンロール" value="rocknroll" color={getPickerTextColor()} />
        <Picker.Item label="BIZ UD明朝" value="biz" color={getPickerTextColor()} />
        <Picker.Item label="モッチーポップ" value="mochiy" color={getPickerTextColor()} />
      </Picker>
    </View>
  );
};

export default FontPickers;

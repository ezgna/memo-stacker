import SettingsModal from "@/src/components/SettingModal";
import { useAuthContext } from "@/src/contexts/AuthContext";
import { useLanguageContext } from "@/src/contexts/LanguageContext";
import { useSettingsContext } from "@/src/contexts/SettingsContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { themeColors } from "@/src/utils/theme";
import React, { useEffect, useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

const customization = () => {
  const { session } = useAuthContext();
  const { theme } = useThemeContext();
  const { autoFocus, updateAutoFocus } = useSettingsContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { language } = useLanguageContext();

  const handleClose = () => {
    setIsModalVisible(false);
  };

  // without session, users can't custom

  const AutoShowKeyboard = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <Text style={{ color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{i18n.t("auto_show_keyboard")}</Text>
        <Switch value={autoFocus} onValueChange={updateAutoFocus} />
      </View>
    );
  };

  const Language = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <Text style={{ color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{i18n.t("language")}</Text>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={{
            width: 65,
            alignItems: "center",
            backgroundColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border,
            paddingVertical: 5,
            borderRadius: 2,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
            }}
          >
            {i18n.t("change")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const data = [
    { id: 1, content: <AutoShowKeyboard /> },
    { id: 2, content: <Language /> },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }}>
      <View style={{ padding: 20 }}>
        <ScrollView scrollEnabled={false}>
          {data.map((item) => (
            <View key={item.id} style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: "lightgray" }}>
              <Text style={{ fontSize: 18, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{item.content}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <SettingsModal isModalVisible={isModalVisible} onClose={handleClose} type="language" />
    </View>
  );
};

export default customization;

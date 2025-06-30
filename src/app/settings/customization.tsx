import CustomText from "@/src/components/CustomText";
import PlatformBannerAd from "@/src/components/PlatformBannerAd";
import SettingsModal from "@/src/components/SettingModal";
import { useLanguageContext } from "@/src/contexts/LanguageContext";
import { useSettingsContext } from "@/src/contexts/SettingsContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { themeColors } from "@/src/utils/theme";
import React, { useState } from "react";
import { Pressable, ScrollView, Switch, View } from "react-native";

const customization = () => {
  const { theme } = useThemeContext();
  const { autoFocus, updateAutoFocus } = useSettingsContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"language" | "theme" | "font" | null>(null);
  const { isJapanese } = useLanguageContext();
  const [isAdsRemoved, setIsAdsRemoved] = useState(false);

  const handleOpen = (type: "language" | "theme" | "font") => {
    setIsModalVisible(true);
    setModalType(type);
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setModalType(null);
  };

  const AutoShowKeyboard = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <CustomText style={{ fontSize: 16 }}>{i18n.t("auto_show_keyboard")}</CustomText>
        <Switch value={autoFocus} onValueChange={updateAutoFocus} />
      </View>
    );
  };

  const Language = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <CustomText style={{ fontSize: 16 }}>{i18n.t("language")}</CustomText>
        <Pressable
          onPress={() => handleOpen("language")}
          style={({ pressed }) => [
            {
              width: 65,
              alignItems: "center",
              backgroundColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border,
              paddingVertical: 5,
              borderRadius: 2,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <CustomText style={{ fontSize: 16 }}>{i18n.t("change")}</CustomText>
        </Pressable>
      </View>
    );
  };

  const Theme = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <CustomText style={{ fontSize: 16 }}>{i18n.t("theme")}</CustomText>
        <Pressable
          onPress={() => handleOpen("theme")}
          style={({ pressed }) => [
            {
              width: 65,
              alignItems: "center",
              backgroundColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border,
              paddingVertical: 4,
              borderRadius: 2,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <CustomText style={{ fontSize: 16 }}>{i18n.t("change")}</CustomText>
        </Pressable>
      </View>
    );
  };

  const Font = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <CustomText style={{ fontSize: 16 }}>{i18n.t("font")}</CustomText>
        <Pressable
          onPress={() => handleOpen("font")}
          style={({ pressed }) => [
            {
              width: 65,
              alignItems: "center",
              backgroundColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border,
              paddingVertical: 5,
              borderRadius: 2,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <CustomText style={{ fontSize: 16 }}>{i18n.t("change")}</CustomText>
        </Pressable>
      </View>
    );
  };

  const data = [{ id: 1, content: <AutoShowKeyboard /> }, { id: 2, content: <Language /> }, { id: 3, content: <Theme /> }, ...(isJapanese ? [{ id: 4, content: <Font /> }] : [])];

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background,
        }}
      >
        <View style={{ padding: 20 }}>
          <ScrollView scrollEnabled={false}>
            {data.map((item) => (
              <View
                key={item.id}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 10,
                  paddingBottom: 5,
                  borderBottomWidth: 1,
                  borderBottomColor: "lightgray",
                }}
              >
                {item.content}
              </View>
            ))}
          </ScrollView>
        </View>
        {modalType && <SettingsModal isModalVisible={isModalVisible} onClose={handleClose} type={modalType} />}
      </View>
      {!isAdsRemoved && <PlatformBannerAd />}
    </>
  );
};

export default customization;

import { useFontContext } from "@/src/contexts/FontContext";
import { useLanguageContext } from "@/src/contexts/LanguageContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { themeColors } from "@/src/utils/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Stack } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity } from "react-native";

const SettingsLayout = () => {
  const { theme } = useThemeContext();
  const { isJapanese } = useLanguageContext();
  const { fontFamilyStyle } = useFontContext();

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
          ...(isJapanese ? fontFamilyStyle : {}),
        },
        headerStyle: { backgroundColor: theme === "dark" ? themeColors.dark.secondaryBackground : "white" },
        headerShown: true,
        headerTintColor: Platform.OS === "android" ? "#007AFF" : undefined,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: i18n.t("settings"),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.replace("/")}>
              <FontAwesome name="close" size={22} color={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="faq" options={{ title: i18n.t("faq") }} />
      <Stack.Screen name="customization" options={{ title: i18n.t("customization") }} />
    </Stack>
  );
};

export default SettingsLayout;

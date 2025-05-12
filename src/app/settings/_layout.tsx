import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { themeColors } from "@/src/utils/theme";
import Feather from "@expo/vector-icons/Feather";
import { router, Stack } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

const SettingsLayout = () => {
  const { theme } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText },
        headerStyle: { backgroundColor: theme === "dark" ? themeColors.dark.secondaryBackground : "white" },
        headerShown: true
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: i18n.t("settings"),
          headerRight: () => (
            <Pressable onPress={() => router.back()}>
              <Feather name="x" size={20} color={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="faq" options={{ title: i18n.t("faq") }} />
      <Stack.Screen name="customization" options={{ title: i18n.t("customization") }} />
    </Stack>
  );
};

export default SettingsLayout;

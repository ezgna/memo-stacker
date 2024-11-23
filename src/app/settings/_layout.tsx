import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { themeColors } from "@/src/utils/theme";
import Feather from "@expo/vector-icons/Feather";
import { router, Stack } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";

const SettingsLayout = () => {
  const { theme } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText },
        headerStyle: { backgroundColor: theme === "dark" ? themeColors.dark.secondaryBackground : "white" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: i18n.t("settings"),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="x" size={20} color={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="account" options={{ title: i18n.t("account") }} />
      <Stack.Screen name="(auth)" options={{ title: "" }} />
      <Stack.Screen name="faq" options={{ title: i18n.t("faq") }} />
      <Stack.Screen name="subscriptionPlans" options={{ title: i18n.t("subscriptionPlans") }} />
    </Stack>
  );
};

export default SettingsLayout;

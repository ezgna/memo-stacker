import i18n from "@/src/utils/i18n";
import Feather from "@expo/vector-icons/Feather";
import { router, Stack } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";

const SettingsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: i18n.t("settings"),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="x" size={20} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="account" options={{ title: i18n.t("account") }} />
      <Stack.Screen name="(auth)" options={{ title: "" }} />
      <Stack.Screen name="(hidden)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default SettingsLayout;

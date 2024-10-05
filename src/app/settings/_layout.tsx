import i18n from "@/src/utils/i18n";
import Feather from "@expo/vector-icons/Feather";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

const SettingsLayout = () => {
  const router = useRouter();
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
    </Stack>
  );
};

export default SettingsLayout;

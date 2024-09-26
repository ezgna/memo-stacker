import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import Feather from '@expo/vector-icons/Feather';

const SettingsLayout = () => {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        title: "Settings",
        headerRight: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={20} color="black" />
          </TouchableOpacity>
        ),
      }}
    />
  );
};

export default SettingsLayout;

const styles = StyleSheet.create({});

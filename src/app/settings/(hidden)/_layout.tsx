import { Stack, useRouter } from "expo-router";
import React from "react";

const HiddenLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="resetPassword" />
    </Stack>
  );
};

export default HiddenLayout;

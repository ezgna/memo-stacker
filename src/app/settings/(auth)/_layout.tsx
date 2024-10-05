import { Stack, useRouter } from "expo-router";
import React from "react";

const AuthLayout = () => {
  const router = useRouter();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgetPassword" />
    </Stack>
  );
};

export default AuthLayout;

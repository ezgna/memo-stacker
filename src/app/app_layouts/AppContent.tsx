import { useThemeContext } from "@/src/contexts/ThemeContext";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

const AppContent = () => {
  const { theme } = useThemeContext();

  return (
    <>
      <Slot />
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </>
  );
};

export default AppContent;

import SearchBox from "@/src/components/SearchBox";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { themeColors } from "@/src/utils/theme";
import Drawer from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import React from "react";
import CustomDrawer from "../CustomDrawer";

const AppContent = () => {
  const { theme } = useThemeContext();

  return (
    <>
      <Drawer
        drawerContent={() => <CustomDrawer />}
        screenOptions={({ route }) => ({
          headerRight: () => <SearchBox />,
          headerShown: !["settings", "(auth)"].includes(route.name),
          headerTitle: "",
          headerStyle: {
            backgroundColor: theme === "dark" ? themeColors.dark.secondaryBackground : themeColors.light.secondaryBackground,
          },
          drawerStyle: {
            width: "40%",
            backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background,
          },
        })}
      />
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </>
  );
};

export default AppContent;
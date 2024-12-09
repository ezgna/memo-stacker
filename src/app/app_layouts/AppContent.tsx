import SearchBox from "@/src/components/SearchBox";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { themeColors } from "@/src/utils/theme";
import Drawer from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import CustomDrawer from "../CustomDrawer";
import { Platform, View } from "react-native";

export const AppContent = () => {
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

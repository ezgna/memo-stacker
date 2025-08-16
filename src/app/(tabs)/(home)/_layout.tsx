import { Drawer } from "expo-router/drawer";
import { Platform } from "react-native";
import SearchBox from "@/src/components/SearchBox";
import { themeColors } from "@/src/utils/theme";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import CustomDrawer from "./CustomDrawer";

export default function DrawerLayout() {
  const { theme } = useThemeContext();

  return (
    <Drawer
      drawerContent={() => <CustomDrawer />}
      screenOptions={() => ({
        drawerType: "front",
        headerRight: () => <SearchBox />,
        headerTintColor: Platform.OS === "android" ? "#007AFF" : undefined,
        headerTitle: "",
        headerStyle: {
          backgroundColor: theme === "dark" ? themeColors.dark.secondaryBackground : themeColors.light.secondaryBackground,
        },
        drawerStyle: {
          width: "38%",
          backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background,
        },
      })}
    />
  );
}

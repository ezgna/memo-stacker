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
      screenOptions={({ route }) => ({
        headerRight: () => <SearchBox />,
        headerTintColor: Platform.OS === "android" ? "#007AFF" : undefined,
        // headerShown: !["settings", "(auth)"].includes(route.name),
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
  );
}

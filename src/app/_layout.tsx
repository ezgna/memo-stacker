import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { useFonts } from "expo-font";
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import SearchBox from "../components/SearchBox";
import { AuthProvider } from "../contexts/AuthContext";
import { DataProvider } from "../contexts/DataContext";
import CustomDrawer from "./CustomDrawer";
import { router } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Kanit: require("../assets/fonts/Kanit-Medium.ttf"),
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    NotoSansJP: require("../assets/fonts/NotoSansJP-Regular.ttf"),
    RocknRollOne: require("../assets/fonts/RocknRollOne-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // router.push('/settings/(auth)/register')
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <DataProvider>
        <ActionSheetProvider>
          <RootSiblingParent>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Drawer
                drawerContent={() => <CustomDrawer />}
                screenOptions={({ route }) => ({
                  headerRight: () => <SearchBox />,
                  headerShown: !["settings", "(auth)"].includes(route.name),
                  headerTitle: "",
                  drawerStyle: {
                    width: "40%",
                  },
                })}
              />
            </GestureHandlerRootView>
          </RootSiblingParent>
        </ActionSheetProvider>
      </DataProvider>
    </AuthProvider>
  );
}

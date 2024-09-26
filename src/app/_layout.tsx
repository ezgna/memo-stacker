import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { useFonts } from "expo-font";
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { DataProvider } from "./components/DataContext";
import SearchBox from "./components/SearchBox";
import CustomDrawer from "./CustomDrawer";
import { Stack } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Kanit: require("../assets/fonts/Kanit-Medium.ttf"),
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <DataProvider>
      <ActionSheetProvider>
        <RootSiblingParent>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
              drawerContent={() => <CustomDrawer />}
              screenOptions={({ route }) => ({
                headerRight: () => <SearchBox />,
                headerShown: route.name !== "settings",
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
  );
}

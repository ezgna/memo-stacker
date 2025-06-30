import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import AppContent from "./app_layouts/AppContent";
import AppProviders from "./app_layouts/AppProviders";
import { router, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useThemeContext } from "../contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    RobotoMono: require("../assets/fonts/RobotoMono-VariableFont_wght.ttf"),
    ZenMaruGothic: require("../assets/fonts/ZenMaruGothic-Medium.ttf"),
    ZenOldMincho: require("../assets/fonts/ZenOldMincho-SemiBold.ttf"),
    RocknRollOne: require("../assets/fonts/RocknRollOne-Regular.ttf"),
    BIZUDMincho: require("../assets/fonts/BIZUDMincho-Regular.ttf"),
    Mochiy: require("../assets/fonts/MochiyPopPOne-Regular.ttf"),
  });
  // const { theme } = useThemeContext();

  const APIKeys = {
    apple: "appl_gwbtLmaQvxoHsyGTjTgYuxyakov",
    google: "goog_FYVDlcrZsZQgYklkuxQbpbgIBnr",
  };
  const initializeRevenueCat = async () => {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    const apiKey = Platform.OS === "android" ? APIKeys.google : APIKeys.apple;
    await Purchases.configure({ apiKey });
  };

  useEffect(() => {
    async function prepare() {
      try {
        if (!fontsLoaded) return;
        await initializeRevenueCat();
        // await new Promise((r) => setTimeout(r, 600));
        SplashScreen.hideAsync();
        setAppReady(true);
        // router.push("/settings/customization");
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, [fontsLoaded]);

  if (!appReady) {
    // Keeps splash screen visible until preparation is done
    return null;
  }

  return (
    <AppProviders>
      <Slot />
      {/* <AppContent /> */}
      {/* <StatusBar style={theme === "dark" ? "light" : "dark"} /> */}
    </AppProviders>
  );
}

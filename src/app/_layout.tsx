import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import AppContent from "./app_layouts/AppContent";
import AppProviders from "./app_layouts/AppProviders";
import { router } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    RobotoMono: require("../assets/fonts/RobotoMono-VariableFont_wght.ttf"),
    ZenMaruGothic: require("../assets/fonts/ZenMaruGothic-Medium.ttf"),
    ZenOldMincho: require("../assets/fonts/ZenOldMincho-SemiBold.ttf"),
    RocknRollOne: require("../assets/fonts/RocknRollOne-Regular.ttf"),
    BIZUDMincho: require("../assets/fonts/BIZUDMincho-Regular.ttf"),
    Mochiy: require("../assets/fonts/MochiyPopPOne-Regular.ttf"),
  });

  const APIKeys = {
    apple: "appl_gwbtLmaQvxoHsyGTjTgYuxyakov",
    google: "goog_FYVDlcrZsZQgYklkuxQbpbgIBnr",
  };
  const initializeRevenueCat = async () => {
    const apiKey = Platform.OS === "android" ? APIKeys.google : APIKeys.apple;
    await Purchases.configure({ apiKey });

    // let uuid = await AsyncStorage.getItem("user_uuid");
    // if (!uuid) {
    //   uuid = Crypto.randomUUID();
    //   await AsyncStorage.setItem("user_uuid", uuid);
    // }
    // console.log(uuid)
    // await Purchases.logIn(uuid);
  };

  useEffect(() => {
    if (loaded) {
      initializeRevenueCat();
      SplashScreen.hideAsync();
      // router.push("/settings/customization");
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

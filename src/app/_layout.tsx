import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { getTrackingPermissionsAsync, PermissionStatus } from "expo-tracking-transparency";
import { useEffect } from "react";
import { Platform } from "react-native";
import mobileAds from "react-native-google-mobile-ads";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { getStep } from "../utils/onboarding";
import AppContent from "./app_layouts/AppContent";
import AppProviders from "./app_layouts/AppProviders";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

export default function RootLayout() {
  // const [appReady, setAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    ZenMaruGothic: require("../assets/fonts/ZenMaruGothic-Medium.ttf"),
    ZenOldMincho: require("../assets/fonts/ZenOldMincho-SemiBold.ttf"),
    RocknRollOne: require("../assets/fonts/RocknRollOne-Regular.ttf"),
    MPlus1p: require("../assets/fonts/MPLUS1p-Medium.ttf"),
  });

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
        // setAppReady(true);
        // router.push("/settings/customization");

        const { status: trackingStatus } = await getTrackingPermissionsAsync();
        if (trackingStatus === PermissionStatus.UNDETERMINED) {
          const s = await getStep();
          if (s < 6) {
            return;
          }
        }
        await mobileAds().initialize();
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, [fontsLoaded]);

  // if (!appReady) {
  //   // Keeps splash screen visible until preparation is done
  //   return null;
  // }

  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

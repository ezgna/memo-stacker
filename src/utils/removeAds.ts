import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";

const APIKeys = {
  apple: "appl_gwbtLmaQvxoHsyGTjTgYuxyakov",
  google: "your_revenuecat_google_api_key",
};

export const removeAds = async () => {
  try {
    // RevenueCat初期化
    const apiKey = Platform.OS === "android" ? APIKeys.google : APIKeys.apple;
    await Purchases.configure({ apiKey });

    // Offering取得
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;

    if (!currentOffering || currentOffering.availablePackages.length === 0) {
      console.warn("No available packages found.");
      return;
    }

    // 最初のパッケージで購入
    const selectedPackage = currentOffering.availablePackages[0];
    const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

    if (customerInfo.entitlements.active["remove_ads_access"]) {
      await AsyncStorage.setItem("isAdsRemoved", "true");
      console.log("It worked!");
    } else {
      console.warn("Purchase succeeded but entitlement is missing.");
    }
  } catch (error: any) {
    if (error.userCancelled) {
      console.log("Purchase cancelled by user.");
    } else {
      console.error("Purchase failed:", error);
    }
  }
};

export const restorePurchase = async () => {
  try {
    const apiKey = Platform.OS === "android" ? APIKeys.google : APIKeys.apple;
    await Purchases.configure({ apiKey });

    const customerInfo = await Purchases.restorePurchases();

    if (customerInfo.entitlements.active["remove_ads_access"]) {
      await AsyncStorage.setItem("isAdsRemoved", "true");
      console.log("Restored successfully! Ads will be removed.");
    } else {
      await AsyncStorage.setItem("isAdsRemoved", "false");
      console.warn("No active entitlement found for remove_ads_access.");
    }
  } catch (error: any) {
    console.error("Restore failed:", error);
  }
};

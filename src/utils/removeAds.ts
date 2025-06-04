import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import Purchases from "react-native-purchases";
import { useDataContext } from "../contexts/DataContext";

const APIKeys = {
  apple: "appl_gwbtLmaQvxoHsyGTjTgYuxyakov",
  google: "your_revenuecat_google_api_key",
};

export const removeAds = async () => {
  try {
    const apiKey = Platform.OS === "android" ? APIKeys.google : APIKeys.apple;
    await Purchases.configure({ apiKey });

    // Offering取得
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;

    if (!currentOffering || currentOffering.availablePackages.length === 0) {
      console.warn("No available packages found.");
      return false;
    }

    // 最初のパッケージで購入
    const selectedPackage = currentOffering.availablePackages[0];
    const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

    if (customerInfo.entitlements.active["remove_ads_access"]) {
      await AsyncStorage.setItem("isAdsRemoved", "true");
      return true;
    } else {
      console.warn("Purchase succeeded but entitlement is missing.");
      return false;
    }
  } catch (error: any) {
    if (error.userCancelled) {
      console.log("Purchase cancelled by user.");
    } else {
      console.error("Purchase failed:", error);
    }
    return false;
  }
};

export const restorePurchase = async () => {
  try {
    const apiKey = Platform.OS === "android" ? APIKeys.google : APIKeys.apple;
    await Purchases.configure({ apiKey });

    const customerInfo = await Purchases.restorePurchases();

    if (customerInfo.entitlements.active["remove_ads_access"]) {
      await AsyncStorage.setItem("isAdsRemoved", "true");
      return true;
    } else {
      await AsyncStorage.setItem("isAdsRemoved", "false");
      console.warn("No active entitlement found for remove_ads_access.");
      return false;
    }
  } catch (error: any) {
    console.error("Restore failed:", error);
    return false;
  }
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases from "react-native-purchases";



export const removeAds = async () => {
  try {

    const appUserID = await Purchases.getAppUserID();
    console.log('appUserID: ', appUserID)

    const info = await Purchases.getCustomerInfo();
    console.log('info: ', info);

    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;

    if (!currentOffering || currentOffering.availablePackages.length === 0) {
      console.warn("No available packages found.");
      return false;
    }

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

    const customerInfo = await Purchases.restorePurchases();

    if (customerInfo.entitlements.active["remove_ads_access"]) {
      await AsyncStorage.setItem("isAdsRemoved", "true");
      return true;
    } else {
      await AsyncStorage.setItem("isAdsRemoved", "false");
      return false;
    }
  } catch (error: any) {
    console.error("Restore failed:", error);
    return false;
  }
};

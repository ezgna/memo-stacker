import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform, Linking } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/src/contexts/AuthContext";
import { Entypo, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import Toast from "react-native-root-toast";
import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";

let pkg: PurchasesPackage | undefined;

const subscriptionPlans = () => {
  const { isProUser, session } = useAuthContext();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePressUpgrade = async (pkg: PurchasesPackage | undefined) => {
    try {
      setIsPurchasing(true);
      if (!session) {
        Toast.show(i18n.t("upgradeRequiresLogin"), {
          position: Toast.positions.CENTER,
        });
        router.push("/settings/(auth)/login");
        return;
      }
      if (!pkg) {
        console.log("No pkg");
        return;
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active["pro"] !== undefined) {
        Alert.alert("purchase successful");
      }
    } catch (e) {
      if (e instanceof Error) {
        Toast.show(e.message);
      } else {
        console.error(e);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const openManageSubscription = () => {
    try {
      let url;
      if (Platform.OS === "ios") {
        url = "itms-apps://apps.apple.com/account/subscriptions";
      } else if (Platform.OS === "android") {
        url = "https://play.google.com/store/account/subscriptions";
      }
      if (url) {
        Linking.openURL(url);
      } else {
        console.log("unknown error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    (async () => {
      const offerings = await Purchases.getOfferings();
      pkg = offerings.current?.availablePackages[0];
    })();
  }, [session]);

  return (
    <View>
      {!isProUser ? (
        <>
          <View
            style={{
              backgroundColor: "#ECEFF1",
              paddingVertical: 20,
              paddingHorizontal: 20,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 4,
              shadowOpacity: 0.1,
              margin: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
              <FontAwesome6 name="face-meh" size={40} color="#9E9E9E" />
              <View style={{ borderWidth: 1, borderRadius: 20, padding: 8 }}>
                <Text style={{ fontSize: 12 }}>
                  <Text style={{ fontWeight: "900" }}>・</Text>Current Plan
                </Text>
              </View>
            </View>
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 15 }}>Free plan</Text>
              <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>✔︎ Manual Backup</Text>
              <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>✔︎ Manual Data Transfer</Text>
              <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>✔︎ Ads Enabled</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity disabled={isPurchasing} onPress={() => handlePressUpgrade(pkg)} style={{ flexDirection: "row", alignItems: "center" }}>
                {isPurchasing ? (
                  <ActivityIndicator />
                ) : (
                  <>
                    <Text style={{ fontSize: 16, marginRight: 4 }}>Upgrade to Pro</Text>
                    <Entypo name="chevron-thin-right" size={13} color="black" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#FFF3E0",
              paddingVertical: 20,
              paddingHorizontal: 20,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 4,
              shadowOpacity: 0.1,
              margin: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
              <FontAwesome6 name="face-smile-wink" size={40} color="#FF9800" />
            </View>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 15 }}>Pro plan🔥</Text>
              <Text style={{ fontSize: 14, marginBottom: 5, letterSpacing: 0.5 }}>✔︎ Auto Backup</Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: "gray" }}>
                Your daily notes are securely saved to a backup system, so even if you lose your device, you can easily recover them.
              </Text>
              <Text style={{ fontSize: 14, marginBottom: 5, letterSpacing: 0.5 }}>✔︎ Cloud Sync</Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: "gray" }}>Access your data across all devices.</Text>
              <Text style={{ fontSize: 14, marginBottom: 5, letterSpacing: 0.5 }}>✔︎ Ad-Free</Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: "gray" }}>
                Enjoy faster navigation and a more professional feel without being interrupted by pop-ups or banner ads.
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View
          style={{
            backgroundColor: "#FFF3E0",
            paddingVertical: 20,
            paddingHorizontal: 20,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 4,
            shadowOpacity: 0.1,
            margin: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
            <FontAwesome6 name="face-smile-wink" size={40} color="#FF9800" />
            <View style={{ borderWidth: 1, borderRadius: 20, padding: 8 }}>
              <Text style={{ fontSize: 12 }}>
                <Text style={{ fontWeight: "900" }}>・</Text>Current Plan
              </Text>
            </View>
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 15 }}>Pro plan🔥</Text>
            <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>✔︎ Auto Backup</Text>
            <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>✔︎ Auto Sync</Text>
            <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>✔︎ Ad-Free</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => openManageSubscription()} style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: "black", marginRight: 4 }}>Unsubscribe</Text>
              <Entypo name="chevron-thin-right" size={13} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default subscriptionPlans;

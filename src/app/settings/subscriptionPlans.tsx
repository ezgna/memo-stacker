import { useAuthContext } from "@/src/contexts/AuthContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { themeColors } from "@/src/utils/theme";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import Toast from "react-native-root-toast";

let pkg: PurchasesPackage | undefined;

const subscriptionPlans = () => {
  const { theme } = useThemeContext();
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
    <View style={{ flex: 1, backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }}>
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
                  <Text style={{ fontWeight: "900" }}>・</Text>
                  {i18n.t("currentPlan")}
                </Text>
              </View>
            </View>
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 15 }}>{i18n.t("freePlan")}</Text>
              <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>{i18n.t("manualBackup")}</Text>
              <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>{i18n.t("manualDataTransfer")}</Text>
              <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>{i18n.t("adsEnabled")}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity disabled={isPurchasing} onPress={() => handlePressUpgrade(pkg)} style={{ flexDirection: "row", alignItems: "center" }}>
                {isPurchasing ? (
                  <ActivityIndicator />
                ) : (
                  <>
                    <Text style={{ fontSize: 16, marginRight: 4 }}>{i18n.t("upgradeToPro")}</Text>
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
              <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 15 }}>{i18n.t("proPlan")}</Text>
                <Text style={{ fontSize: 16 }}>¥300/月</Text>
              </View>
              <Text style={{ fontSize: 14, marginBottom: 5, letterSpacing: 0.5 }}>{i18n.t("autoBackup")}</Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: "gray" }}>{i18n.t("autoBackupDescription")}</Text>
              <Text style={{ fontSize: 14, marginBottom: 5, letterSpacing: 0.5 }}>{i18n.t("cloudSync")}</Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: "gray" }}>{i18n.t("cloudSyncDescription")}</Text>
              <Text style={{ fontSize: 14, marginBottom: 5, letterSpacing: 0.5 }}>{i18n.t("adFree")}</Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: "gray" }}>{i18n.t("adFreeDescription")}</Text>
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
                <Text style={{ fontWeight: "900" }}>・</Text>
                {i18n.t("currentPlan")}
              </Text>
            </View>
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 15 }}>{i18n.t("proPlan")}</Text>
            <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>{i18n.t("autoBackup")}</Text>
            <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>{i18n.t("cloudSync")}</Text>
            <Text style={{ fontSize: 14, marginBottom: 10, letterSpacing: 0.5 }}>{i18n.t("adFree")}</Text>
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

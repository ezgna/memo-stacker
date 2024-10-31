import { useAuthContext } from "@/src/contexts/AuthContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";
import { themeColors } from "@/src/utils/theme";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import Toast from "react-native-root-toast";

let pkg: PurchasesPackage | undefined;

const account = () => {
  const { session, isProUser } = useAuthContext();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { message }: { message: string } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const { theme } = useThemeContext();

  const RegisterLink = () => {
    return (
      <TouchableOpacity onPress={() => router.push("/settings/(auth)/register")}>
        <Text style={{ fontSize: 18, color: "steelblue", fontWeight: 600 }}>Sign up here</Text>
      </TouchableOpacity>
    );
  };

  const handlePressChangeOrReset = async (type: string, email?: string) => {
    if (type === "email") {
      router.push("/settings/changeEmail");
    } else if (type === "password") {
      const confirmed = await new Promise((resolve) => {
        Alert.alert("Confirm your action", "Are you sure you want to reset your password?", [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Reset",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ]);
      });
      if (!confirmed) return;
      if (!email) {
        console.log("email not exist");
        Toast.show("unknown error");
        return;
      }
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setLoading(false);
        console.error(error);
        alert(error.message);
      } else {
        setLoading(false);
        Alert.alert("A password reset email has been sent to your current email address. Please check your inbox!");
      }
    }
  };

  const handlePressUpgrade = async (pkg: PurchasesPackage | undefined) => {
    try {
      setIsPurchasing(true);
      if (!session) {
        Toast.show(i18n.t("upgradeRequiresSignUp"), {
          position: Toast.positions.CENTER,
        });
        router.push("/settings/(auth)/register");
        return;
      }
      if (!pkg) return;
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

  const LoggedIn = ({ type }: { type: string }) => {
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "flex-end" }}>
        {type === "email" && (
          <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{session?.user.email}</Text>
        )}
        {type === "password" && (
          <Text style={{ fontSize: 14, color: theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.secondaryText }}>
            you can only reset your password.
          </Text>
        )}
        <TouchableOpacity disabled={loading} onPress={() => handlePressChangeOrReset(type, session?.user.email)}>
          {type === "email" ? (
            <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>Change</Text>
          ) : type === "password" && loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>Reset</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const Free = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", width: "100%" }}>
        <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{`${i18n.t("free")}`}</Text>
        <TouchableOpacity disabled={isPurchasing} onPress={() => handlePressUpgrade(pkg)}>
          {isPurchasing ? <ActivityIndicator /> : <Text style={{ fontSize: 17, color: "gold", fontWeight: "bold" }}>{`${i18n.t("upgrade")}`}</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  const data = [
    { id: 1, label: `${i18n.t("plan")}`, content: isProUser ? `${i18n.t("pro")}` : Free() },
    { id: 2, label: `${i18n.t("email")}`, content: session ? <LoggedIn type="email" /> : RegisterLink() },
    { id: 3, label: `${i18n.t("password")}`, content: session ? <LoggedIn type="password" /> : "" },
  ];

  const signOut = async () => {
    Alert.alert(`${i18n.t("signOut")}`, `${i18n.t("confirmSignOut")}`, [
      {
        text: `${i18n.t("cancel")}`,
        style: "cancel",
      },
      {
        text: `${i18n.t("signOut")}`,
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          await Purchases.logOut();
          await SecureStore.deleteItemAsync("password");
          Toast.show("You signed out");
        },
      },
    ]);
  };

  useEffect(() => {
    (async () => {
      const offerings = await Purchases.getOfferings();
      pkg = offerings.current?.availablePackages[0];
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (message) {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error(error);
          return;
        }
        Toast.show(message, {
          position: Toast.positions.CENTER,
        });
      }
    })();
  }, [message]);

  return (
    <View style={{ flex: 1, backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }}>
      <View style={{ padding: 20 }}>
        <ScrollView scrollEnabled={false}>
          {data.map((item) => (
            <View key={item.id} style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: "lightgray" }}>
              <Text style={{ fontSize: 14, paddingBottom: 10, color: theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.secondaryText }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: 18 }}>{item.content}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      {session && (
        <View>
          <Button title="sign out" onPress={() => signOut()} />
        </View>
      )}
    </View>
  );
};

export default account;

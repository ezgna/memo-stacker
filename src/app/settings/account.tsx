import { useAuthContext } from "@/src/contexts/AuthContext";
import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import Toast from "react-native-root-toast";

let pkg: PurchasesPackage | undefined;

const account = () => {
  const { session, setSession, isProUser } = useAuthContext();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { message }: { message: string } = useLocalSearchParams();

  const RegisterLink = () => {
    return (
      <TouchableOpacity onPress={() => router.push("/settings/(auth)/register")}>
        <Text style={{ fontSize: 18, color: "steelblue", fontWeight: 600 }}>Sign up here</Text>
      </TouchableOpacity>
    );
  };

  const handlePressChangeEmail = () => {
    router.push("/settings/changeEmail");
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

  const RegisteredEmail = () => {
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        <Text style={{ fontSize: 17 }}>{session?.user.email}</Text>
        <TouchableOpacity onPress={() => handlePressChangeEmail()}>
          <Text style={{ fontSize: 17 }}>Change</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const Free = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <Text style={{ fontSize: 17 }}>{`${i18n.t("free")}`}</Text>
        <TouchableOpacity disabled={isPurchasing} onPress={() => handlePressUpgrade(pkg)}>
          {isPurchasing ? <ActivityIndicator /> : <Text style={{ fontSize: 17, color: "gold", fontWeight: "bold" }}>{`${i18n.t("upgrade")}`}</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  const data = [
    { id: 1, label: `${i18n.t("email")}`, content: session ? RegisteredEmail() : RegisterLink() },
    { id: 2, label: `${i18n.t("plan")}`, content: isProUser ? `${i18n.t("pro")}` : Free() },
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
          console.error(error)
          return
        }
        Toast.show(message, {
          position: Toast.positions.CENTER,
        });
      }
    })();
  }, [message]);

  return (
    <View style={{ padding: 20 }}>
      <ScrollView>
        {data.map((item) => (
          <View key={item.id} style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: "lightgray" }}>
            <Text style={{ fontSize: 14, color: "dimgray", paddingBottom: 10 }}>{item.label}</Text>
            <Text style={{ fontSize: 18 }}>{item.content}</Text>
          </View>
        ))}
      </ScrollView>
      {session && (
        <View style={{ marginTop: 10 }}>
          <Button title="sign out" onPress={() => signOut()} />
        </View>
      )}
    </View>
  );
};

export default account;

import { useAuthContext } from "@/src/contexts/AuthContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { useDatabase } from "@/src/hooks/useDatabase";
import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";
import { themeColors } from "@/src/utils/theme";
import { Entry } from "@/types";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import Toast from "react-native-root-toast";

// let pkg: PurchasesPackage | undefined;

const account = () => {
  const { session } = useAuthContext();
  // const { message }: { message: string } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const { theme } = useThemeContext();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [username, setUsername] = useState("");
  const db = useDatabase();
  const [amount, setAmount] = useState(0);
  const [days, setDays] = useState(0);

  const handlePressChangeOrReset = async (type: string, email?: string) => {
    if (type === "email") {
      router.push("/settings/changeEmail");
    } else if (type === "password") {
      const confirmed = await new Promise((resolve) => {
        Alert.alert(`${i18n.t("confirm_password_reset_title")}`, `${i18n.t("confirm_password_reset_message")}`, [
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
        Alert.alert(`${i18n.t("password_reset_email_sent")}`);
      }
    } else if (type === "username") {
      router.push("/settings/changeUsername");
    }
  };

  const Profile = ({ type }: { type: string }) => {
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
        {type === "email" && (
          <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{session?.user.email}</Text>
        )}
        {type === "password" && (
          <Text style={{ fontSize: 13, color: theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.secondaryText }}>{i18n.t("password_reset_only")}</Text>
        )}
        {type === "username" && (
          <Text
            style={{
              fontSize: username ? 17 : 13,
              color:
                theme === "dark"
                  ? username
                    ? themeColors.dark.primaryText
                    : themeColors.dark.secondaryText
                  : username
                    ? themeColors.light.primaryText
                    : themeColors.light.secondaryText,
            }}
          >
            {username || i18n.t("username_unset")}
          </Text>
        )}
        <TouchableOpacity
          disabled={loading}
          onPress={() => handlePressChangeOrReset(type, session?.user.email)}
          style={{
            width: 65,
            alignItems: "center",
            backgroundColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border,
            paddingVertical: 5,
            borderRadius: 2,
          }}
        >
          {type === "email" ? (
            <Text
              style={{
                fontSize: 15,
                color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
              }}
            >
              {i18n.t("change")}
            </Text>
          ) : type === "username" ? (
            <Text style={{ fontSize: 15, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>
              {username ? i18n.t("change") : i18n.t("setup")}
            </Text>
          ) : type === "password" && loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ fontSize: 15, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{i18n.t("reset")}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const Status = ({ type }: { type: string }) => {
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
        {type === "amount" && <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{amount}</Text>}
        {type === "days" && <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{days}</Text>}
      </View>
    );
  };

  const profileData = [
    { id: 1, label: `${i18n.t("username")}`, content: session && <Profile type="username" /> },
    { id: 2, label: `${i18n.t("email")}`, content: session && <Profile type="email" /> },
    { id: 3, label: `${i18n.t("password")}`, content: session && <Profile type="password" /> },
  ];

  const statusData = [
    { id: 1, label: `${i18n.t("memo_amount")}`, content: session && <Status type="amount" /> },
    { id: 2, label: `${i18n.t("used_days")}`, content: session && <Status type="days" /> },
  ];

  useEffect(() => {
    (async () => {
      if (!db) return;
      try {
        const amountResult: { count: number }[] = await db.getAllAsync("SELECT COUNT(*) AS count FROM entries WHERE deleted_at IS NULL");
        setAmount(amountResult[0]?.count);
        const daysResult: { unique_days: number }[] = await db.getAllAsync("SELECT COUNT(DISTINCT date) AS unique_days FROM entries WHERE deleted_at IS NULL;");
        setDays(daysResult[0]?.unique_days);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [db]);

  const signOut = async () => {
    Alert.alert(`${i18n.t("confirmSignOut")}`, "", [
      {
        text: `${i18n.t("cancel")}`,
        style: "cancel",
      },
      {
        text: `${i18n.t("signOut")}`,
        style: "destructive",
        onPress: async () => {
          setIsSigningOut(true);
          await Purchases.logOut();
          await supabase.auth.signOut();
          Toast.show("You signed out");
          setIsSigningOut(false);
          router.back();
        },
      },
    ]);
  };
  const segments = useSegments();

  useEffect(() => {
    (async () => {
      if (!session) return;
      const { data, error } = await supabase.from("profiles").select("username").eq("user_id", session?.user.id).single();
      if (error) {
        console.error('supabase.from("profiles").select("username").eq("user_id", session?.user.id).single()', error);
        return;
      } else if (data.username) {
        setUsername(data.username);
      }
      // console.log(data, error)
      // if (error?.details === "The result contains 0 rows") {
      //   // console.error('no username exist')
      //   setUsername("");
      // } else if (data) {
      //   setUsername(data.username);
      // }
    })();
  }, [session, segments]);

  useEffect(() => {
    (async () => {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("refreshError:", refreshError);
        return;
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }}>
      <View style={{ padding: 20 }}>
        <ScrollView scrollEnabled={false}>
          <Text style={{ fontSize: 20, paddingLeft: 0 }}>Your profile</Text>
          {profileData.map(
            (item) =>
              item.content && (
                <View key={item.id} style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: "lightgray" }}>
                  <Text style={{ fontSize: 14, paddingBottom: 10, color: theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.secondaryText }}>
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 18, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{item.content}</Text>
                </View>
              )
          )}
        </ScrollView>
      </View>
      <View>{isSigningOut ? <ActivityIndicator /> : <Button title={i18n.t("signOut")} onPress={() => signOut()} />}</View>
      <View style={{ padding: 20 }}>
        <ScrollView scrollEnabled={false}>
          <Text style={{ fontSize: 20, paddingLeft: 0 }}>Your status</Text>
          {statusData.map(
            (item) =>
              item.content && (
                <View key={item.id} style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: "lightgray" }}>
                  <Text style={{ fontSize: 14, paddingBottom: 10, color: theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.secondaryText }}>
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 18, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{item.content}</Text>
                </View>
              )
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default account;

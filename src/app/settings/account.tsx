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
  const { message }: { message: string } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const { theme } = useThemeContext();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [username, setUsername] = useState(null);

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

  const LoggedIn = ({ type }: { type: string }) => {
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        <View style={{ flex: 1 }}>
          {type === "email" && (
            <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{session?.user.email}</Text>
          )}
          {type === "password" && (
            <Text style={{ fontSize: 13, color: theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.secondaryText }}>
              {i18n.t("password_reset_only")}
            </Text>
          )}
          {type === "username" && (
            <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{username ? username : i18n.t('username_unset')}</Text>
          )}
        </View>
        <TouchableOpacity disabled={loading} onPress={() => handlePressChangeOrReset(type, session?.user.email)}>
          {type === "email" || type === "username" ? (
            <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{i18n.t("change")}</Text>
          ) : type === "password" && loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ fontSize: 17, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{i18n.t("reset")}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const data = [
    { id: 1, label: `${i18n.t("username")}`, content: session && <LoggedIn type="username" /> },
    { id: 2, label: `${i18n.t("email")}`, content: session && <LoggedIn type="email" /> },
    { id: 3, label: `${i18n.t("password")}`, content: session && <LoggedIn type="password" /> },
  ];

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
          // await SecureStore.deleteItemAsync("password");
          await supabase.auth.signOut();
          Toast.show("You signed out");
          setIsSigningOut(false);
          router.push("/settings/");
        },
      },
    ]);
  };

  useEffect(() => {
    (async () => {
      const offerings = await Purchases.getOfferings();
      pkg = offerings.current?.availablePackages[0];
      const { data, error } = await supabase.from("users").select("username").eq("user_id", session?.user.id).single();
      if (error?.details === "The result contains 0 rows") {
        // console.error('no username exist')
        setUsername(null)
      } else if (data) {
        setUsername(data.username);
      }
    })();
  }, [session]);

  useEffect(() => {
    (async () => {
      if (message) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error(refreshError);
          return;
        }
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error(error);
          return;
        } else if (session) {
          const { error } = await supabase.from("users").update({ email: session?.user.email }).eq("user_id", session?.user.id);
          if (error) {
            console.error(error);
            return;
          }
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
          {data.map(
            (item) =>
              item.content && (
                <View
                  key={item.id}
                  style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: "lightgray" }}
                >
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
    </View>
  );
};

export default account;

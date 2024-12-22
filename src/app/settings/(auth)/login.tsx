import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";
import { themeColors } from "@/src/utils/theme";
import { AntDesign } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoES from "crypto-es";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Button, Text, themeColor } from "react-native-rapi-ui";
import Toast from "react-native-root-toast";

let email: string;

export default function () {
  const router = useRouter();
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  // const { message }: { message: string } = useLocalSearchParams();
  const [isInvalidUsername, setIsInvalidUsername] = useState(false);
  const [isNotConfirmed, setIsNotConfirmed] = useState(false);
  const { theme } = useThemeContext();

  const isValidUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9]{4,16}$/;
    return usernameRegex.test(username);
  };

  const login = async () => {
    try {
      setLoading(true);
      if (!identifier.includes("@")) {
        if (!isValidUsername(identifier)) {
          Toast.show("Invalid username");
          return;
        }

        const { data: selectedEmail, error: selectEmailError } = await supabase.from("profiles").select("email").eq("username", identifier).single();
        if (selectEmailError) {
          console.error("unknown selectEmailError:", selectEmailError);
          return;
        }

        // const { data: fetchedUser_id, error: user_idFetchError } = await supabase.from("users").select("user_id").eq("username", identifier).single();
        // if (user_idFetchError) {
        //   console.error("user_idFetchError:", user_idFetchError);
        // }
        // const { data: fetchedEmail, error: emailFetchError } = await supabase.from("auth.users").select("email").eq("id", fetchedUser_id?.user_id).single();

        // const { data, error: getUserError } = await supabase.auth.getUser();
        // if (getUserError) {
        //   console.error("unknown error(getUserError):", getUserError);
        //   return;
        // }
        // if (!data.user.email) {
        //   console.error('unknown error: No data.user.email.')
        //   return;
        // }
        // email = data.user.email;

        // console.log(data);
        // console.log(identifier)
        // const { data: fetchedUserId, error: userIdFetchError } = await supabase.from("users").select("user_id").eq("username", identifier).single();
        // if (userIdFetchError) {
        //   console.error('supabase.from("users").select("user_id").eq("username", identifier).single()', userIdFetchError);
        //   return;
        // }
        // const { data: fetchedEmail, error: emailFetchError } = await supabase.from("auth.users").select("email").eq("id", fetchedUserId).single();
        // if (emailFetchError) {
        //   console.error(emailFetchError);
        //   return;
        // }
        // if (error) {
        //   setIsInvalidUsername(true);
        //   console.log(identifier);
        //   return;
        // }
        email = selectedEmail?.email;
      }
      const {
        error,
        data: { session },
      } = await supabase.auth.signInWithPassword({
        email: email || identifier,
        password: password,
      });
      if (error) {
        if (error.message === "Email not confirmed") {
          Alert.alert("Email not confirmed", i18n.t("email_not_verified"), [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Resend",
              style: "destructive",
              onPress: async () => {
                const { error } = await supabase.auth.signUp({
                  email: identifier,
                  password: password,
                  options: {
                    data: {
                      language: i18n.locale,
                    },
                    emailRedirectTo: "memologminute://settings/login?message=Email+Verified.+Login+here.",
                  },
                });
                if (error) {
                  console.error("const { error } = await supabase.auth.signUp({", error);
                  return;
                }
                Toast.show(i18n.t("email_resent"), {
                  position: Toast.positions.CENTER,
                });
                setIsNotConfirmed(true);
              },
            },
          ]);
        } else {
          Alert.alert(error.message);
        }
        return;
      } else if (session) {
        // ここ全部不要か？
        const userId = session.user.id;
        const { data: userIdInUsers, error } = await supabase.from("users").select().eq("user_id", userId);
        if (error) console.error('supabase.from("users").select().eq("user_id", userId)', error);
        if (userIdInUsers && userIdInUsers.length > 0) {
          // console.log("userIdInUsers exists", userIdInUsers[0]);
        } else {
          // const masterKey: string = generateMasterKey();
          // const kek = Constants.expoConfig?.extra?.KEY_WRAPPER;
          // if (!kek) {
          //   console.log('kek not exist')
          // }
          // const encryptedMasterKey: CryptoES.lib.CipherParams = CryptoES.AES.encrypt(masterKey, kek, {
          //   format: jsonFormatter,
          // });
          // const formattedEncryptedMasterKey: string = jsonFormatter.stringify(encryptedMasterKey);
          // const username = await AsyncStorage.getItem("username");
          // if (!username) {
          //   console.error("no username");
          // }
          // const { error } = await supabase.from("users").insert({ user_id: userId, master_key: formattedEncryptedMasterKey, username, email: session.user.email });
          // if (error) {
          //   console.error('supabase.from("users").insert({ user_id: userId, master_key: formattedEncryptedMasterKey, username, email: session.user.email })', error);
          // }
        }
        router.back();
        Toast.show("you logged in!");
        // await SecureStore.setItemAsync("password", password);
      } else {
        console.log("session not exist");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setIdentifier("");
      setPassword("");
      email = "";
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        // marginTop: 30,
      }}
      scrollEnabled={false}
    >
      <View
        style={{
          flex: 2,
          paddingHorizontal: 20,
          paddingBottom: 300,
          backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background,
        }}
      >
        {isNotConfirmed && (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 30 }}>
            <AntDesign name="exclamationcircleo" size={25} color="red" style={{ paddingRight: 15 }} />
            <Text style={{ paddingRight: 30 }}>{i18n.t("email_not_received")}</Text>
          </View>
        )}
        <Text
          fontWeight="bold"
          size="h3"
          style={{
            alignSelf: "center",
            padding: 30,
            color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
          }}
        >
          {i18n.t("login")}
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background,
              borderColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border,
              color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
            },
          ]}
          placeholder={isInvalidUsername ? "First time logging in? Use your email, not username" : i18n.t("email_or_username")}
          placeholderTextColor={theme === "dark" ? undefined : "#999"}
          value={identifier}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          onChangeText={(text) => setIdentifier(text)}
        />

        <View
          style={[
            {
              paddingTop: 12.5,
              paddingBottom: 12.5,
              borderWidth: 1,
              borderRadius: 8,
              paddingLeft: 20,
              paddingRight: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background,
              borderColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border,
              marginTop: 20,
            },
          ]}
        >
          <TextInput
            style={{ width: "80%", color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}
            placeholder={i18n.t("password")}
            placeholderTextColor={theme === "dark" ? undefined : "#999"}
            value={password}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            secureTextEntry={showPassword}
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginRight: 5 }}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={themeColor.gray} />
          </TouchableOpacity>
        </View>
        <Button
          text={loading ? "Loading" : i18n.t("continue")}
          onPress={() => {
            login();
          }}
          style={{
            marginTop: 20,
          }}
          disabled={loading}
          textStyle={{ marginVertical: 3 }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 25,
            justifyContent: "center",
          }}
        >
          <Text size="md" style={{ color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>
            {i18n.t("dont_have_account")}
          </Text>
          <TouchableOpacity
            onPress={() => {
              router.replace("/settings/(auth)/register");
            }}
          >
            <Text
              size="md"
              fontWeight="bold"
              style={{
                marginLeft: 5,
                color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
              }}
            >
              {i18n.t("registerHere")}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 20,
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              router.replace("/settings/(auth)/forgetPassword");
            }}
          >
            <Text size="md" fontWeight="bold" style={{ color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>
              {i18n.t("forget_password")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
});

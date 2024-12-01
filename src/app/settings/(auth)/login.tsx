import { generateKeyFromPassword, generateMasterKey, jsonFormatter } from "@/src/utils/encryption";
import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import CryptoES from "crypto-es";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, Image, Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput, themeColor } from "react-native-rapi-ui";
import { component } from "react-native-rapi-ui/constants/colors";
import Toast from "react-native-root-toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";

let email: string;

export default function () {
  const router = useRouter();
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [imageHeight, setImageHeight] = useState(240);
  // const { message }: { message: string } = useLocalSearchParams();
  const [isInvalidUsername, setIsInvalidUsername] = useState(false);
  const [isNotConfirmed, setIsNotConfirmed] = useState(false);

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
        const { data, error } = await supabase.from("users").select("email").eq("username", identifier).single();
        if (error) {
          setIsInvalidUsername(true);
          console.log(identifier);
          return;
        }
        email = data.email;
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
        const userId = session.user.id;
        const { data: userIdInUsers, error } = await supabase.from("users").select().eq("user_id", userId);
        if (error) console.error('supabase.from("users").select().eq("user_id", userId)', error);
        if (userIdInUsers && userIdInUsers.length > 0) {
          // console.log("userIdInUsers exists", userIdInUsers[0]);
        } else {
          const masterKey: string = generateMasterKey();
          const key: string = generateKeyFromPassword(password);
          setPassword(key);
          const encryptedMasterKey: CryptoES.lib.CipherParams = CryptoES.AES.encrypt(masterKey, password, {
            format: jsonFormatter,
          });
          const formattedEncryptedMasterKey: string = jsonFormatter.stringify(encryptedMasterKey);
          const username = await AsyncStorage.getItem("username");
          if (!username) {
            console.error("no username");
          }
          const { error } = await supabase.from("users").insert({ user_id: userId, master_key: formattedEncryptedMasterKey, username, email: session.user.email });
          if (error) {
            console.error('supabase.from("users").insert({ user_id: userId, master_key: formattedEncryptedMasterKey, username, email: session.user.email })', error);
          }
        }
        router.navigate("/");
        Toast.show("you logged in!");
        await SecureStore.setItemAsync("password", password);
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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setImageHeight(0);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setImageHeight(240);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // useEffect(() => {
  //   if (message) {
  //     Toast.show(message, {
  //       position: Toast.positions.CENTER,
  //     });
  //   }
  // }, [message]);

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
          // flex: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          resizeMode="contain"
          style={{
            height: imageHeight,
            aspectRatio: 1,
          }}
          source={require("@/src/assets/images/login.png")}
        />
      </View>
      <View
        style={{
          flex: 2,
          paddingHorizontal: 20,
          paddingBottom: 300,
          backgroundColor: themeColor.white,
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
          }}
        >
          {i18n.t("login")}
        </Text>
        <Text style={{ marginBottom: 10 }}>Email or Username</Text>
        <TextInput
          containerStyle={{ paddingVertical: 5 }}
          borderColor={isInvalidUsername ? "red" : undefined}
          placeholder={isInvalidUsername ? "First time logging in? Use your email, not username" : "Enter your email or username"}
          value={identifier}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          onChangeText={(text) => setIdentifier(text)}
        />

        <Text style={{ marginTop: 15, marginBottom: 10 }}>Password</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderRadius: 8,
            borderColor: component["light"].textInput.borderColor,
          }}
        >
          <TextInput
            borderWidth={0}
            containerStyle={{ paddingVertical: 5, flex: 1 }}
            placeholder="Enter your password"
            value={password}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            secureTextEntry={showPassword}
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginRight: 15 }}>
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
            marginTop: 15,
            justifyContent: "center",
          }}
        >
          <Text size="md">{i18n.t("dont_have_account")}</Text>
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
            <Text size="md" fontWeight="bold">
              {i18n.t("forget_password")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

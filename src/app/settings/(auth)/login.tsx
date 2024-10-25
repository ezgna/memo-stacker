import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Keyboard, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput, themeColor } from "react-native-rapi-ui";
import { component } from "react-native-rapi-ui/constants/colors";
import Toast from "react-native-root-toast";
import * as SecureStore from "expo-secure-store";
import CryptoES from "crypto-es";
import { WordArray } from "crypto-es/lib/core";
import { generateKeyFromPassword, generateMasterKey, jsonFormatter } from "@/src/utils/encryption";

export default function () {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [imageHeight, setImageHeight] = useState(240);

  const login = async () => {
    setLoading(true);
    const {
      error,
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    } else if (session) {
      const userId = session.user.id;
      const { data: userIdInUsers, error } = await supabase.from("users").select().eq("user_id", userId);
      if (error) console.error(error);
      if (userIdInUsers && userIdInUsers.length > 0) {
        console.log("userIdInUsers exists", userIdInUsers[0]);
      } else {
        const masterKey: string = generateMasterKey();
        const key: string = generateKeyFromPassword(password)
        setPassword(key);
        const encryptedMasterKey: CryptoES.lib.CipherParams = CryptoES.AES.encrypt(masterKey, password, {
          format: jsonFormatter,
        });
        const formattedEncryptedMasterKey: string = jsonFormatter.stringify(encryptedMasterKey);
        const { error } = await supabase
          .from("users")
          .insert({ user_id: userId, master_key: formattedEncryptedMasterKey });
        if (error) {
          console.error(error);
        }
      }
      Toast.show("you logged in!");
      router.navigate("/");
      await SecureStore.setItemAsync("password", password);
    } else {
      console.log("session not exist");
    }
    setLoading(false);
    setEmail("");
    setPassword("");
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
          source={require("@/assets/images/login.png")}
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
        <Text style={{ marginBottom: 10 }}>Email</Text>
        <TextInput
          containerStyle={{ paddingVertical: 5 }}
          placeholder="Enter your email"
          value={email}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={(text) => setEmail(text)}
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
          <Text size="md">Don't have an account?</Text>
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
              Forget password
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

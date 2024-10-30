import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput, themeColor } from "react-native-rapi-ui";
import { component } from "react-native-rapi-ui/constants/colors";
import Toast from "react-native-root-toast";

export default function () {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [imageHeight, setImageHeight] = useState(240);

  const register = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          language: i18n.locale,
        },
        emailRedirectTo: 'memologminute://settings/login?message=Email+Verified.+Login+here.',
      },
    });
    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }
    if (!session) {
      Alert.alert(i18n.t("email_verification_propmt"));
      router.navigate('/')
    } else if (session) {
      Toast.show("You Signed up");
      router.navigate("/");
    }
    setEmail("");
    setPassword("");
    setLoading(false);
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
          source={require("@/assets/images/register.png")}
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
          {i18n.t("register")}
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
            containerStyle={{ flex: 1, paddingVertical: 5 }}
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
          text={loading ? "Loading" : i18n.t("createAnAccount")}
          onPress={() => {
            register();
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
          <Text size="md">Already have an account?</Text>
          <TouchableOpacity
            onPress={() => {
              router.replace("/settings/(auth)/login");
            }}
          >
            <Text
              size="md"
              fontWeight="bold"
              style={{
                marginLeft: 5,
              }}
            >
              {i18n.t("loginHere")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

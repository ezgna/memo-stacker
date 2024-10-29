import { supabase } from "@/src/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput, themeColor } from "react-native-rapi-ui";
import Toast from "react-native-root-toast";

export default function () {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { token_hash }: { token_hash: string } = useLocalSearchParams();

  async function reset() {
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({ password: password });
    if (error) {
      console.error(error);
      Alert.alert("There was an error updating your password.");
      setLoading(false);
      return;
    }
    if (data) {
      router.navigate("/settings/(auth)/login");
      Toast.show("Password updated successfully!", {
        position: Toast.positions.CENTER,
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: "recovery",
      });
      if (error) {
        console.error(error);
        Toast.show("Unknown Error");
      } else {
        Toast.show("Please enter your new password");
      }
    })();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        marginTop: 80,
      }}
      scrollEnabled={false}
    >
      <View
        style={{
          flex: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          resizeMode="contain"
          style={{
            height: 240,
            width: 240,
          }}
          source={require("@/assets/images/forget.png")}
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
          Reset Password
        </Text>
        <Text style={{ marginBottom: 10 }}>New Password</Text>
        <TextInput
          containerStyle={{ paddingVertical: 5 }}
          placeholder="Enter your new password"
          value={password}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="visible-password"
          onChangeText={(text) => setPassword(text)}
        />
        <Button
          text={loading ? "Loading" : "Reset password"}
          onPress={() => {
            reset();
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
              Login here
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

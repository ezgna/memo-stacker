import { useAuthContext } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/utils/supabase";
import { UNSTABLE_usePreventRemove } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, View } from "react-native";
import { Button, Text, TextInput, themeColor } from "react-native-rapi-ui";
import Toast from "react-native-root-toast";

export default function () {
  const router = useRouter();
  const { session } = useAuthContext();
  const [newPassword, setNewPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { token_hash }: { token_hash: string } = useLocalSearchParams();
  const navigation = useNavigation();
  const [isPreventingRemove, setIsPrevengingRemove] = useState(true);
  const userId = session?.user.id || null;

  async function reset() {
    setLoading(true);
    setIsPrevengingRemove(false);
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      setIsPrevengingRemove(true);
      return;
    }
    if (data) {
      // try {
      //   if (!userId) {
      //     console.error("No userId!");
      //     return;
      //   }
      //   const { data, error } = await supabase.from("users").select("master_key").eq("user_id", userId);
      //   if (error) {
      //     console.error('supabase.from("users").select("master_key").eq("user_id", userId)', error);
      //   }
      //   if (!(data && data.length > 0)) {
      //     console.log("no data exist");
      //     return;
      //   }
      //   const { master_key: encryptedMasterKey } = data[0];
      //   const password = await SecureStore.getItemAsync("password");
      //   if (!password) {
      //     console.log("password not exist");
      //     return;
      //   }
      //   const kek = Constants.expoConfig?.extra?.KEY_WRAPPER;
      //   if (!kek) {
      //     console.log('kek not exist')
      //   }
      //   const decryptedMasterKey: string = CryptoES.AES.decrypt(encryptedMasterKey, kek, {
      //     format: jsonFormatter,
      //   }).toString(CryptoES.enc.Utf8);

      //   const key: string = generateKeyFromPassword(newPassword);
      //   setNewPassword(key);
      //   const newEncryptedMasterKey: CryptoES.lib.CipherParams = CryptoES.AES.encrypt(decryptedMasterKey, newPassword, {
      //     format: jsonFormatter,
      //   });
      //   const formattedNewEncryptedMasterKey: string = jsonFormatter.stringify(newEncryptedMasterKey);
      //   const { error: updateError } = await supabase.from("users").update({ master_key: formattedNewEncryptedMasterKey }).eq("user_id", userId);
      //   if (updateError) {
      //     console.error(updateError);
      //   }
      // } catch (error) {
      //   console.error(error);
      // }

      // await SecureStore.setItemAsync("password", newPassword);
      router.replace("/settings/account");
      Toast.show("Password updated successfully!", {
        position: Toast.positions.CENTER,
      });
    }
    setNewPassword("");
    setLoading(false);
  }

  UNSTABLE_usePreventRemove(isPreventingRemove, ({ data }) => {
    Alert.alert(`If you leave now, your password won't be changed.`, "Are you sure you want to leave?", [
      { text: `Don't leave`, style: "cancel" },
      { text: "leave", style: "destructive", onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  useEffect(() => {
    (async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: "recovery",
      });
      if (error) {
        console.error(error);
        Toast.show("Unknown Error");
        router.navigate("/");
      } else {
        if (session) {
          Toast.show("Please enter your new password");
        } else {
          Toast.show("You're automatically logged in. Please enter your new password");
        }
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
          source={require("@/src/assets/images/forget.png")}
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
          value={newPassword}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="visible-password"
          onChangeText={(text) => setNewPassword(text)}
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
      </View>
    </ScrollView>
  );
}

import { useAuthContext } from "@/src/contexts/AuthContext";
import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput, themeColor } from "react-native-rapi-ui";
import { component } from "react-native-rapi-ui/constants/colors";
import Toast from "react-native-root-toast";

export default function () {
  const { session } = useAuthContext();
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);

  const isValidUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9]{4,16}$/;
    return usernameRegex.test(username);
  };

  async function changeUsername() {
    setLoading(true);
    try {
      if (!isValidUsername(username)) {
        setIsUsernameValid(false);
        setUsername("");
        Toast.show("Invalid username");
        return;
      } else {
        const { data: currentUsernameData, error: usernameFetchError } = await supabase.from("users").select("username").eq("user_id", session?.user.id).single();
        if (usernameFetchError) {
          console.error(usernameFetchError);
        } else if (currentUsernameData) {
          if (currentUsernameData.username === username) {
            setUsername("");
            setIsUsernameValid(false);
            Toast.show("The new username is the same as the current one.");
            return;
          }
        }

        const { data, error } = await supabase.from("users").select("user_id").eq("username", username).single();
        if (data) {
          Toast.show(i18n.t("username_already_taken"));
          setIsUsernameValid(false);
          setUsername("");
          return;
        } else if (error.details === "The result contains 0 rows") {
          setIsUsernameValid(true);
          const { error } = await supabase.from("users").update({ username: username }).eq("user_id", session?.user.id);
          if (error) {
            console.error(error);
            return;
          }
          Toast.show("Username changed");
          router.replace("/settings/account");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }

    setUsername("");
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        marginTop: 150,
      }}
      scrollEnabled={false}
    >
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
          Change Username
        </Text>

        <Text style={{ marginBottom: 10 }}>New Username</Text>
        <TextInput
          containerStyle={{ paddingVertical: 5 }}
          borderColor={!isUsernameValid ? "red" : undefined}
          placeholder={i18n.t("username_requirement")}
          value={username}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={(text) => setUsername(text)}
        />

        <Button
          text={loading ? "Loading" : "Continue"}
          onPress={() => {
            changeUsername();
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

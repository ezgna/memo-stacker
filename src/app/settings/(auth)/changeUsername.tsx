import { useAuthContext } from "@/src/contexts/AuthContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";
import { themeColors } from "@/src/utils/theme";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View, StyleSheet, TextInput } from "react-native";
import { Button, Text, themeColor } from "react-native-rapi-ui";
import Toast from "react-native-root-toast";

export default function () {
  const { session } = useAuthContext();
  const userId = session?.user.id;
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [error, setError] = useState<string>("");
  const { theme } = useThemeContext();

  const isValidUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9]{4,16}$/;
    return usernameRegex.test(username);
  };

  async function changeUsername() {
    setLoading(true);
    try {
      if (!userId) {
        console.error("No userId");
        return;
      }
      if (!isValidUsername(username)) {
        setIsUsernameValid(false);
        setUsername("");
        Toast.show("Invalid username");
        return;
      } else {
        const { error: insertError } = await supabase.from("users").insert({ user_id: userId, username });
        if (insertError) {
          // console.log("insertError:", insertError);
          if (insertError.message === 'duplicate key value violates unique constraint "users_username_key"') {
            const { data, error: selectError } = await supabase.from("users").select("username").eq("user_id", userId).single();
            if (selectError) {
              // console.log("selectError:", selectError);
              if (selectError.details === "The result contains 0 rows") {
                setError(selectError.details);
                return;
              }
              console.error("unknown error:", selectError);
              return;
            }
            if (data.username === username) {
              setError(insertError.message);
              return;
            }
          } else if (insertError.message === 'duplicate key value violates unique constraint "users_pkey"') {
            const { error: updateError } = await supabase.from("users").update({ username }).eq("user_id", session.user.id);
            if (updateError) {
              console.error("unknown error:", updateError);
              return;
            }
            setUsername("");
            setError("");
            router.back();
            Toast.show("Username successfully changed");
            return;
          }
          console.error("unknown error", insertError);
          return;
        }
      }
      setUsername("");
      setError("");
      router.back();
      Toast.show("Username successfully set");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
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
        <Text
          fontWeight="bold"
          size="h3"
          style={{
            alignSelf: "center",
            padding: 30,
            color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
          }}
        >
          Change Username
        </Text>

        <Text style={{ marginBottom: 10, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>New Username</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background,
              borderColor: error ? "red" : theme === "dark" ? themeColors.dark.border : themeColors.light.border,
              color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
            },
          ]}
          placeholder={i18n.t("username_requirement")}
          placeholderTextColor={theme === "dark" ? undefined : "#999"}
          value={username}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          onChangeText={(text) => setUsername(text)}
        />
        {error && (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
            <AntDesign name="exclamationcircleo" size={12} color="red" style={{ paddingRight: 5 }} />

            <Text style={{ fontSize: 12, color: "red" }}>
              {error === 'duplicate key value violates unique constraint "users_username_key"'
                ? i18n.t("username_already_in_use")
                : error === "The result contains 0 rows"
                  ? i18n.t("username_already_taken")
                  : "Unknown error"}
            </Text>
          </View>
        )}

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

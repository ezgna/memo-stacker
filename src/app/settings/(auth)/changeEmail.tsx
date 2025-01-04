import { useAuthContext } from "@/src/contexts/AuthContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { supabase } from "@/src/utils/supabase";
import { themeColors } from "@/src/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Button, Text, themeColor } from "react-native-rapi-ui";
import Toast from "react-native-root-toast";

export default function () {
  const { session } = useAuthContext();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const { theme } = useThemeContext();
  const [error, setError] = useState<string>("");

  async function changeEmail() {
    setLoading(true);
    if (session && session.user && session.user.email) {
      if (session.user.email === email) {
        Toast.show("The new email address is the same as the current one.", {
          position: Toast.positions.CENTER,
        });
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: session.user.email, password });
      if (error) {
        Toast.show(error.message, {
          position: Toast.positions.CENTER,
        });
        setLoading(false);
        return;
      }
    } else {
      console.error("session not exist");
      Toast.show("unknown error");
      return;
    }
    const { data, error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: "https://sites.google.com/view/memolog-minute/confirmation" });
    if (error) {
      console.error(error);
      Toast.show(error.message, {
        position: Toast.positions.CENTER,
      });
      setLoading(false);
      return;
    }
    if (data) {
      Alert.alert(i18n.t("confirmation_email_sent"));
      router.navigate("/");
    }
    setLoading(false);
    setEmail("");
    setPassword("");
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
          Change Email
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background,
              borderColor: error ? "red" : theme === "dark" ? themeColors.dark.border : themeColors.light.border,
              color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
            },
          ]}
          placeholder={i18n.t("new_email")}
          placeholderTextColor={theme === "dark" ? undefined : "#999"}
          value={email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          onChangeText={(text) => setEmail(text)}
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
          text={loading ? "Loading" : "Continue"}
          onPress={() => {
            changeEmail();
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

import { useAuthContext } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput, themeColor } from "react-native-rapi-ui";
import { component } from "react-native-rapi-ui/constants/colors";
import Toast from "react-native-root-toast";

export default function () {
  const { session } = useAuthContext();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

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
      console.log("session not exist");
      Toast.show("unknown error");
    }
    const { data, error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: "memologminute://settings/account?message=Email+Updated+Successfully!" }
    );
    if (error) {
      console.error(error);
      Toast.show(error.message, {
        position: Toast.positions.CENTER,
      });
      setLoading(false);
      return;
    }
    if (data) {
      Alert.alert("A confirmation email has been sent to your new address. Please check your inbox.");
    }
    setLoading(false);
    setEmail("");
    setPassword("");
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
          Change Email
        </Text>

        <Text style={{ marginBottom: 10 }}>New email</Text>
        <TextInput
          containerStyle={{ paddingVertical: 5 }}
          placeholder="Enter your new email"
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

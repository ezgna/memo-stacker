import { useAuthContext } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/utils/supabase";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-rapi-ui";
import Toast from "react-native-root-toast";

interface AccountListType {
  id: number;
  label: string;
  content: any;
}

const account = () => {
  const { session } = useAuthContext();

  const RegisterLink = () => {
    return (
      <TouchableOpacity onPress={() => router.push("/settings/(auth)/register")}>
        <Text style={{ fontSize: 18, color: "steelblue", fontWeight: 600 }}>Sign up here</Text>
      </TouchableOpacity>
    );
  };

  const data = [
    { id: 1, label: "Email address", content: session ? session?.user.email : RegisterLink() },
    { id: 2, label: "Your plan", content: "Free" },
  ];

  const signOut = async () => {
    await supabase.auth.signOut();
    Toast.show("You signed out");
  };

  const renderItem = ({ item }: { item: AccountListType }) => (
    <View style={{ flex: 1, padding: 10, borderBottomWidth: 1, borderBottomColor: "lightgray" }}>
      <Text style={{ fontSize: 14, color: "dimgray", paddingBottom: 10 }}>{item.label}</Text>
      <Text style={{ fontSize: 18 }}>{item.content}</Text>
    </View>
  );

  return (
    <View style={{ padding: 20 }}>
      <ScrollView style={{ marginBottom: 20 }}>
        {data.map((item) => (
          <View
            key={item.id}
            style={{ flex: 1, padding: 10, borderBottomWidth: 1, borderBottomColor: "lightgray" }}
          >
            <Text style={{ fontSize: 14, color: "dimgray", paddingBottom: 10 }}>{item.label}</Text>
            <Text style={{ fontSize: 18 }}>{item.content}</Text>
          </View>
        ))}
      </ScrollView>
      {session && <Button text="sign out" onPress={() => signOut()} />}
    </View>
  );
};

export default account;

const styles = StyleSheet.create({});

// import { StyleSheet, Text, View } from "react-native";
// import React from "react";
// import { FlashList } from "@shopify/flash-list";

// const AccountScreen = () => {
//   const data = [
//     { id: 1, label: "label" },
//     { id: 2, label: "label2" },
//   ];

//   const renderItem = ({item}) =>(

//   )

//   return (
//     <View>
//       <FlashList data={data} renderItem={renderItem} />
//     </View>
//   );
// };

// export default AccountScreen;

// const styles = StyleSheet.create({});

import { useAuthContext } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/utils/supabase";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-rapi-ui";
import Toast from "react-native-root-toast";

const account = () => {
  const { session } = useAuthContext();

  const signOut = async () => {
    await supabase.auth.signOut();
    Toast.show("You signed out");
  };

  // useEffect(() => {
  //   console.log(typeof(session.user.id));
  // }, [session]);

  return (
    <View>
      <Text>Your status</Text>
      <Text>{session ? `${session.user.email}` : "Not logged in"}</Text>
      <Button text="register here" onPress={() => router.push("/settings/(auth)/register")} />
      {session && <Button text="sign out" onPress={() => signOut()} />}
    </View>
  );
};

export default account;

const styles = StyleSheet.create({});

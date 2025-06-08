import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity } from "react-native";
import i18n from "../utils/i18n";
import CustomText from "./CustomText";

const CancelEditButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}>
      <CustomText style={styles.text}>{`${i18n.t("cancelEdit")}`}</CustomText>
    </Pressable>
  );
};

export default CancelEditButton;

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 80,
    bottom: 24,
  },
  text: {
    fontSize: 16,
    color: "gray",
    fontWeight: "500",
  },
});

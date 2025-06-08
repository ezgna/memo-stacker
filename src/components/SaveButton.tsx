import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity } from "react-native";
import i18n from "../utils/i18n";
import CustomText from "./CustomText";

const SaveButton = ({ onPress, editingId }: { onPress: () => void; editingId: string | null }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.saveButton,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <CustomText style={styles.saveText}>{editingId ? `${i18n.t("done")}` : `${i18n.t("save")}`}</CustomText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  saveButton: {
    backgroundColor: "gray",
    alignItems: "center",
    padding: 6,
    width: "15%",
    borderRadius: 5,
    position: "absolute",
    right: 10,
    bottom: 18,
  },
  saveText: {
    fontSize: 16,
    color: "#F4F6F7",
  },
});

export default SaveButton;

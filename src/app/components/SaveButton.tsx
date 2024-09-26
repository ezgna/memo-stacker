import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const SaveButton = ({ onPress, editingId }: { onPress: () => void; editingId: number | null }) => {
  return (
    <TouchableOpacity style={styles.saveButton} onPress={onPress} activeOpacity={0.5}>
      <Text style={styles.saveText}>{editingId ? "Done" : "Save"}</Text>
    </TouchableOpacity>
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

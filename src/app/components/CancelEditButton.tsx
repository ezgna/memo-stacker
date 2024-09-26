import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const CancelEditButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.5}>
      <Text style={styles.text}>Cancel Edit</Text>
    </TouchableOpacity>
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

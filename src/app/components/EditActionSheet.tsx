import { useActionSheet } from "@expo/react-native-action-sheet";
import { Entypo } from "@expo/vector-icons";
import { FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface EditActionSheetProps {
  deleteEntry: () => void;
  updateEntry: () => void;
}

export const EditActionSheet: FC<EditActionSheetProps> = ({ deleteEntry, updateEntry }) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const onPress = () => {
    const options = ["Edit", "Delete", "Cancel"];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            updateEntry();
            break;

          case destructiveButtonIndex:
            deleteEntry();
            break;

          case cancelButtonIndex:
          // Canceled
        }
      }
    );
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Entypo name="dots-three-horizontal" size={14} color="#696880" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

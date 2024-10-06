import { useActionSheet } from "@expo/react-native-action-sheet";
import { Entypo } from "@expo/vector-icons";
import { FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface EditActionSheetProps {
  deleteEntry: () => void;
  updateEntry: () => void;
  isTrash: boolean | undefined;
  restoreEntry: (() => void) | undefined;
}

export const EditActionSheet: FC<EditActionSheetProps> = ({
  deleteEntry,
  updateEntry,
  isTrash,
  restoreEntry,
}) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const onPress = () => {
    const options = isTrash ? ["Restore", "Cancel"] : ["Edit", "Delete", "Cancel"];
    const destructiveButtonIndex = isTrash ? undefined : 1;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            if (isTrash && restoreEntry) {
              restoreEntry();
            } else {
              updateEntry();
            }
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

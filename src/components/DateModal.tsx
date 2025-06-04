import { Entry } from "@/src/database/types";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { FC, useEffect, useState } from "react";
import { Modal, StyleSheet, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { useDataContext } from "../contexts/DataContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { themeColors } from "../utils/theme";
import CancelEditButton from "./CancelEditButton";
import { FlashListCompo } from "./FlashListCompo";
import SaveButton from "./SaveButton";

interface DateModalProps {
  onClose: () => void;
  modalVisible: boolean;
  selectedEntries: Entry[];
  onDelete: (id: string) => void;
  updateEntry: (editingText: string, editingId: string) => void;
  isTrash: boolean;
  onRestore: (id: string) => void;
}

export const DateModal: FC<DateModalProps> = ({ onClose, modalVisible, selectedEntries, onDelete, updateEntry, isTrash, onRestore }) => {
  const { dataUpdated } = useDataContext();
  const [editingText, setEditingText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { theme } = useThemeContext();

  const handleEdit = (text: string, id: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  useEffect(() => {
    setEditingId(null);
    setEditingText("");
  }, [dataUpdated]);

  return (
    <Modal visible={modalVisible} transparent animationType="slide">
      <ActionSheetProvider>
        <View style={styles.container}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <View
            style={[
              styles.modalContainer,
              isTrash
                ? { backgroundColor: theme === "dark" ? "black" : "gainsboro" }
                : { backgroundColor: theme === "dark" ? themeColors.dark.secondaryBackground : "snow" },
            ]}
          >
            {editingId ? (
              <View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
                      borderColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border,
                    },
                  ]}
                  value={editingText}
                  onChangeText={setEditingText}
                  multiline
                />
                <CancelEditButton onPress={() => cancelEdit()} />
                <SaveButton onPress={() => updateEntry(editingText, editingId)} editingId={editingId} />
              </View>
            ) : null}
            <FlashListCompo data={selectedEntries} onDelete={onDelete} onUpdate={handleEdit} editingId={editingId} isTrash={isTrash} onRestore={onRestore} />
          </View>
        </View>
      </ActionSheetProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    height: "60%",
    width: "100%",
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "gainsboro",
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 18,
    paddingHorizontal: 15,
    paddingBottom: 45,
    paddingVertical: 10,
  },
});

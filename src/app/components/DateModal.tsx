import { FC, useEffect, useState } from "react";
import { Modal, StyleSheet, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { FlashListCompo } from "./FlashListCompo";
import { Entry } from "@/types";
import { useDataContext } from "./DataContext";
import SaveButton from "./SaveButton";
import CancelEditButton from "./CancelEditButton";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

interface DateModalProps {
  onClose: () => void;
  modalVisible: boolean;
  selectedEntries: Entry[];
  onDelete: (id: number) => void;
  updateEntry: (editingText: string, editingId: number) => void;
}

export const DateModal: FC<DateModalProps> = ({
  onClose,
  modalVisible,
  selectedEntries,
  onDelete,
  updateEntry,
}) => {
  const { dataUpdated } = useDataContext();
  const [editingText, setEditingText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleEdit = (text: string, id: number) => {
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
    <Modal visible={modalVisible} transparent={true} animationType="slide">
      <ActionSheetProvider>
        <View style={styles.container}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            {editingId ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={editingText}
                  onChangeText={setEditingText}
                  multiline
                />
                <CancelEditButton onPress={() => cancelEdit()} />
                <SaveButton onPress={() => updateEntry(editingText, editingId)} editingId={editingId} />
              </View>
            ) : null}
            <FlashListCompo data={selectedEntries} onDelete={onDelete} onUpdate={handleEdit} />
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
    backgroundColor: "snow",
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

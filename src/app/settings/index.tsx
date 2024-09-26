import { ExportGDrive, handleFileSelect, InportGDrive } from "@/src/services/GDriveUtils";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FlashList } from "@shopify/flash-list";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

interface SettingsListType {
  id: number;
  label: string;
}

interface Files {
  name: string;
  id: string;
}

const SettingsScreen = () => {
  const [files, setFiles] = useState<Files[] | null>(null);

  const data = [
    { id: 1, label: "Export" },
    { id: 2, label: "Inport" },
  ];

  const handlePress = async (id: number) => {
    switch (id) {
      case 1:
        await ExportGDrive();
        break;
      case 2:
        const importedFiles = await InportGDrive();
        setFiles(importedFiles);
        break;
      default:
        break;
    }
  };

  const handleFileSelectWithClear = (id: string)=>{
    handleFileSelect(id);
    setFiles(null);
  }

  const renderItem = ({ item }: { item: SettingsListType }) => (
    <TouchableOpacity onPress={() => handlePress(item.id)}>
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
  );

  const ListFooterComponent = () => {
    return (
      files && (
        <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: "silver", flex: 1 }}>
          <FlashList
            data={files}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleFileSelectWithClear(item.id)} style={styles.file}>
                <MaterialCommunityIcons name="file-document" size={24} color='#4285F4' />
                <Text style={{ paddingLeft: 5 }}>{item.name}</Text>
              </TouchableOpacity>
            )}
            estimatedItemSize={15}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "silver" }} />}
          />
        </View>
      )
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={data}
        renderItem={renderItem}
        estimatedItemSize={20}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "silver" }} />}
        ListFooterComponent={ListFooterComponent()}
      />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  label: {
    fontSize: 24,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  file: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingVertical: 5,
  },
});

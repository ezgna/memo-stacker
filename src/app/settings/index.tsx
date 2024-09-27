import { useDatabase } from "@/src/hooks/useDatabase";
import { ExportGDrive, handleFileSelect, InportGDrive } from "@/src/services/GDriveUtils";
import { Entry } from "@/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FlashList } from "@shopify/flash-list";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDataContext } from "../components/DataContext";

interface SettingsListType {
  id: number;
  label: string;
}

interface Files {
  name: string;
  id: string;
}

const SettingsScreen = () => {
  const db = useDatabase();
  const [files, setFiles] = useState<Files[] | null>(null);
  const { dataUpdated, setDataUpdated } = useDataContext();


  const data = [
    { id: 1, label: "Export" },
    { id: 2, label: "Inport" },
  ];

  const handlePress = async (id: number) => {
    switch (id) {
      case 1:
        if (!db) {
          Alert.alert("database initialize error");
        } else {
          await ExportGDrive(db);
        }
        break;
      case 2:
        const importedFiles = await InportGDrive();
        setFiles(importedFiles);
        break;
      default:
        break;
    }
  };

  const restoreDatabase = async (dataList: Entry[]) => {
    if (!db) {
      Alert.alert("database initialize error");
    } else {
      const placeholders = dataList.map(() => "(?,?,?,?)").join(",");
      const values = dataList.reduce(
        (acc, data) => acc.concat([data.created_at, data.date, data.text, data.user_id]),
        [] as string[]
      );
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO entries (created_at, date, text, user_id) VALUES ${placeholders}`,
          values
        );
      });
      console.log("transaction successfully committed");
      setFiles(null);
      setDataUpdated(!dataUpdated)
    }
  };

  const handleFileSelectWithClear = async (id: string) => {
    const importedDataList = await handleFileSelect(id);
    restoreDatabase(importedDataList);
  };

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
                <MaterialCommunityIcons name="file-document" size={24} color="#4285F4" />
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

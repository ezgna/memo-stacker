import { useDatabase } from "@/src/hooks/useDatabase";
import { ExportGDrive, handleFileSelect, InportGDrive } from "@/src/services/GDriveUtils";
import { Entry } from "@/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDataContext } from "../components/DataContext";
import i18n, { isJapanese } from "@/src/utils/i18n";

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
    { id: 1, label: `${i18n.t("export")}` },
    { id: 2, label: `${i18n.t("inport")}` },
  ];

  const handlePress = async (id: number) => {
    switch (id) {
      case 1:
        if (!db) {
          Alert.alert("database initialize error");
        } else {
          const exportedFileName = await ExportGDrive(db);
          Alert.alert(
            `A file "${exportedFileName}" was successfully created on your own google drive. Please import it on your new device.`
          );
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
    try {
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
        setFiles(null);
        setDataUpdated(!dataUpdated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileSelectWithClear = async (id: string, name: string) => {
    const importedDataList = await handleFileSelect(id);
    restoreDatabase(importedDataList);
    Alert.alert(`A file "${name}" was successfully imported to this device!`);
  };

  const renderItem = useCallback(
    ({ item }: { item: SettingsListType }) => (
      <TouchableOpacity onPress={() => handlePress(item.id)}>
        <Text style={isJapanese ? [styles.label, { fontFamily: "NotoSansJP" }] : styles.label}>
          {item.label}
        </Text>
      </TouchableOpacity>
    ),
    [handlePress]
  );

  const ListFooterComponent = () => {
    return (
      files && (
        <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: "silver", flex: 1 }}>
          <FlashList
            data={files}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleFileSelectWithClear(item.id, item.name)}
                style={styles.file}
              >
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
    fontSize: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  file: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingVertical: 3,
  },
});

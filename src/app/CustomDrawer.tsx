import { db } from "@/src/database/db";
import { Entry } from "@/src/database/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, SectionList, SectionListRenderItem, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { DateModal } from "../components/DateModal";
import { useDataContext } from "../contexts/DataContext";
import { useLanguageContext } from "../contexts/LanguageContext";
import { useThemeContext } from "../contexts/ThemeContext";
import i18n from "../utils/i18n";
import { themeColors } from "../utils/theme";
import CustomText from "../components/CustomText";

interface Dates {
  date: string;
  entries: Entry[];
}

interface Months {
  month: string;
  dates: Dates[];
}

interface GroupedData {
  year: string;
  months: Months[];
}

export default function CustomDrawer() {
  const { dataUpdated, setDataUpdated } = useDataContext();
  const [fetchedData, setFetchedData] = useState<GroupedData[]>([]);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);
  const [isTrash, setIsTrash] = useState(false);
  const { theme } = useThemeContext();
  const { isJapanese } = useLanguageContext();

  useEffect(() => {
    if (!db) return;
    const fetchData = async () => {
      const allEntries: Entry[] = await db!.getAllAsync("SELECT * FROM entries WHERE deleted_at IS NULL ORDER BY created_at DESC");
      const groupedByYear = allEntries.reduce<Record<string, Record<string, Entry[]>>>((acc, entry) => {
        // console.log(`[${Platform.OS}]`, entry.date)
        // console.log(`[${Platform.OS}]`, entry.created_at)
        const year = entry.date.slice(0, 4);
        const month = entry.date.slice(5, 7);
        if (!acc[year]) {
          acc[year] = {};
        }
        if (!acc[year][month]) {
          acc[year][month] = [];
        }
        acc[year][month].push(entry);
        return acc;
      }, {});

      const groupedData = Object.keys(groupedByYear).map((year) => {
        const months = Object.keys(groupedByYear[year])
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((month) => {
            const entriesByDate = groupedByYear[year][month].reduce<Record<string, Entry[]>>((acc, entry) => {
              if (!acc[entry.date]) {
                acc[entry.date] = [];
              }
              acc[entry.date].push(entry);
              return acc;
            }, {});
            const dates = Object.keys(entriesByDate)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map((date) => ({
                date,
                entries: entriesByDate[date],
              }))
              .reverse();
            return {
              month,
              dates,
            };
          });
        return {
          year,
          months,
        };
      });
      setFetchedData(groupedData);
    };

    fetchData();
  }, [db, dataUpdated]);

  const toggleCollapsed = (key: string) => {
    setCollapsedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleEntryPress = (entries: Entry[]) => {
    setModalVisible(true);
    setSelectedEntries(entries);
    setIsTrash(false);
  };

  const sections = fetchedData.map((group) => ({
    title: group.year,
    data: group.months,
  }));

  const CollapseIndicator = ({ element }: { element: string }) => (
    <AntDesign name={collapsedItems[element] ? "down" : "right"} size={16} color={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText} />
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <TouchableOpacity onPress={() => toggleCollapsed(title)} style={styles.collapseButton}>
      <CollapseIndicator element={title} />
      <Text style={[styles.titleText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderItem: SectionListRenderItem<Months, { title: string; data: Months[] }> = ({ item, section }) => (
    <View>
      <Collapsible collapsed={!collapsedItems[section.title]}>
        <TouchableOpacity
          onPress={() => toggleCollapsed(item.month)}
          style={[styles.collapseButton, { paddingLeft: 16, borderLeftWidth: 2, borderLeftColor: "grey", marginLeft: 7 }]}
        >
          <CollapseIndicator element={item.month} />
          <Text style={[styles.titleText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{item.month}</Text>
        </TouchableOpacity>
        <Collapsible collapsed={!collapsedItems[item.month]}>
          {item.dates.map((dateItem) => (
            <View style={{ paddingLeft: 23, borderLeftWidth: 2, borderLeftColor: "gray", marginLeft: 7 }} key={dateItem.date}>
              <TouchableOpacity key={dateItem.date} onPress={() => handleEntryPress(dateItem.entries)} style={{ paddingLeft: 13, borderLeftWidth: 2, borderLeftColor: "grey" }}>
                <Text style={[styles.titleText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{dateItem.date.slice(7)}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Collapsible>
      </Collapsible>
    </View>
  );

  const deleteEntry = async (id: string) => {
    if (!db) return;
    try {
      const confirmed = await new Promise((resolve) => {
        Alert.alert("Confirm Deletion", "Are you sure you want to delete your entry?", [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ]);
      });
      if (!confirmed) return;

      const updateAt = new Date().toISOString();
      const deletedAt = new Date().toISOString();
      await db.runAsync("UPDATE entries SET updated_at = ?, deleted_at = ? WHERE id = ?", [updateAt, deletedAt, id]);
      setDataUpdated(!dataUpdated);
      setSelectedEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const updateEntry = async (editingText: string, editingId: string) => {
    if (!db) return;
    try {
      const updateAt = new Date().toISOString();
      const trimmedEditingText = editingText.trim();
      await db.runAsync(`UPDATE entries SET text = ?, updated_at = ? WHERE id = ?`, [trimmedEditingText, updateAt, editingId]);
      setDataUpdated(!dataUpdated);
      setSelectedEntries((prev) => prev.map((entry) => (entry.id === editingId ? { ...entry, text: editingText } : entry)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrashPress = async () => {
    if (!db) return;
    const deletedEntries: Entry[] = await db.getAllAsync("SELECT * FROM entries WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC");
    setIsTrash(true);
    setModalVisible(true);
    setSelectedEntries(deletedEntries);
  };

  const restoreFromTrash = async (id: string) => {
    if (!db) return;
    try {
      const updateAt = new Date().toISOString();
      await db.runAsync("UPDATE entries SET updated_at = ?, deleted_at = ? WHERE id = ?", [updateAt, null, id]);
      setDataUpdated(!dataUpdated);
      setSelectedEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: 20,
        marginTop: Platform.OS === "android" ? 40 : 60,
        // flex: 1,
        backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background,
      }}
    >
      <View
        style={{
          borderBottomWidth: 2,
          marginBottom: 5,
          flexDirection: "row",
          alignItems: "center",
          borderBottomColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border,
          paddingBottom: 2,
          paddingLeft: 2,
          justifyContent: "space-between",
        }}
      >
        <Text style={[{ color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText, fontSize: 21, fontFamily: "RocknRollOne", lineHeight: 26 }]}>
          {i18n.t("memolog")}
        </Text>
        <TouchableOpacity onPress={() => router.navigate("/settings")}>
          <Ionicons name="settings-outline" size={24} color={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText} />
        </TouchableOpacity>
      </View>
      {fetchedData && fetchedData.length > 0 ? (
        <>
          <SectionList sections={sections} renderSectionHeader={renderSectionHeader} renderItem={renderItem} />
        </>
      ) : (
        <>
          <CustomText style={{ fontSize: 16, textAlign: "right", paddingRight: 4, marginBottom: 10, }}>{i18n.t("go_to_settings")}</CustomText>
          <CustomText>{i18n.t("no_memo_yet")}</CustomText>
        </>
      )}
      {/* <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: theme === "dark" ? themeColors.dark.secondaryBackground : "gainsboro",
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
            opacity: pressed ? 0.6 : 1,
          },
        ]}
        onPress={() => handleTrashPress()}
      >
        <Ionicons name="trash-outline" size={26} color={theme === "dark" ? "silver" : "#333"} />
      </Pressable> */}

      <DateModal
        onClose={() => setModalVisible(false)}
        modalVisible={modalVisible}
        selectedEntries={selectedEntries}
        onDelete={deleteEntry}
        updateEntry={updateEntry}
        isTrash={isTrash}
        onRestore={restoreFromTrash}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  collapseButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: 20,
    paddingLeft: 5,
    paddingBottom: 2,
    fontFamily: "RobotoMono",
  },
});

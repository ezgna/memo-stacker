import CustomText from "@/src/components/CustomText";
import { DateModal } from "@/src/components/DateModal";
import { useDataContext } from "@/src/contexts/DataContext";
import { useFontContext } from "@/src/contexts/FontContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { db } from "@/src/database/db";
import { Entry } from "@/src/database/types";
import i18n from "@/src/utils/i18n";
import { getStep, setStep } from "@/src/utils/onboarding";
import { themeColors } from "@/src/utils/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDrawerStatus } from "@react-navigation/drawer";
import React, { useEffect, useState } from "react";
import { Alert, SectionList, SectionListRenderItem, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Collapsible from "react-native-collapsible";

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
  const isDrawerOpen = useDrawerStatus() === "open";
  const { fontFamilyStyle } = useFontContext();

  useEffect(() => {
    (async () => {
      const s = await getStep();
      if (isDrawerOpen && s === 2) {
        const title = i18n.t("onboarding.step3.title");
        const lines = i18n.t("onboarding.step3.description", { returnObjects: true }) as string[];
        const message = lines.join("\n");
        setTimeout(() => {
          Alert.alert(
            title,
            message,
            [
              {
                text: "OK",
                onPress: async () => {
                  await setStep(3);
                },
              },
            ],
            { cancelable: false }
          );
        }, 500);
      }
    })();
  }, [isDrawerOpen]);

  useEffect(() => {
    (async () => {
      const s = await getStep();
      if (modalVisible && s === 3) {
        const title = i18n.t("onboarding.step4.title");
        const lines = i18n.t("onboarding.step4.description", { returnObjects: true }) as string[];
        const message = lines.join("\n");
        setTimeout(() => {
          Alert.alert(
            title,
            message,
            [
              {
                text: "OK",
                onPress: async () => {
                  await setStep(4);
                },
              },
            ],
            { cancelable: false }
          );
        }, 500);
      }
    })();
  }, [modalVisible]);

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
        marginTop: 50,
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
        <Text style={[{ color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText, fontSize: 18, fontFamily: "ZenMaruGothic", lineHeight: 26 }]}>
          MemoStacker
        </Text>
      </View>
      {fetchedData && fetchedData.length > 0 ? (
        <>
          <SectionList sections={sections} renderSectionHeader={renderSectionHeader} renderItem={renderItem} />
        </>
      ) : (
        <>
          <CustomText>{i18n.t("no_memo_yet")}</CustomText>
        </>
      )}

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
    fontFamily: "MPlus1p",
  },
});

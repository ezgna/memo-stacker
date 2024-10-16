import { Entry } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { SectionList, SectionListRenderItem, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { DateModal } from "../components/DateModal";
import { useDataContext } from "../contexts/DataContext";
import { useDatabase } from "../hooks/useDatabase";
import i18n, { isJapanese } from "../utils/i18n";

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
  const db = useDatabase();
  const { dataUpdated, setDataUpdated } = useDataContext();
  const [fetchedData, setFetchedData] = useState<GroupedData[]>([]);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);
  const [isTrash, setIsTrash] = useState(false);

  useEffect(() => {
    if (!db) return;
    const fetchData = async () => {
      const allEntries: Entry[] = await db.getAllAsync("SELECT * FROM entries ORDER BY created_at DESC");
      const groupedByYear = allEntries.reduce<Record<string, Record<string, Entry[]>>>((acc, entry) => {
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
    <AntDesign name={collapsedItems[element] ? "down" : "right"} size={16} color="black" />
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <TouchableOpacity onPress={() => toggleCollapsed(title)} style={styles.collapseButton}>
      <CollapseIndicator element={title} />
      <Text style={styles.titleText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderItem: SectionListRenderItem<Months, { title: string; data: Months[] }> = ({
    item,
    section,
  }) => (
    <View>
      <Collapsible collapsed={!collapsedItems[section.title]}>
        <TouchableOpacity
          onPress={() => toggleCollapsed(item.month)}
          style={[
            styles.collapseButton,
            { paddingLeft: 16, borderLeftWidth: 2, borderLeftColor: "grey", marginLeft: 7 },
          ]}
        >
          <CollapseIndicator element={item.month} />
          <Text style={styles.titleText}>{item.month}</Text>
        </TouchableOpacity>
        <Collapsible collapsed={!collapsedItems[item.month]}>
          {item.dates.map((dateItem) => (
            <View
              style={{ paddingLeft: 23, borderLeftWidth: 2, borderLeftColor: "gray", marginLeft: 7 }}
              key={dateItem.date}
            >
              <TouchableOpacity
                key={dateItem.date}
                onPress={() => handleEntryPress(dateItem.entries)}
                style={{ paddingLeft: 13, borderLeftWidth: 2, borderLeftColor: "grey" }}
              >
                <Text style={styles.titleText}>{dateItem.date.slice(7)}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Collapsible>
      </Collapsible>
    </View>
  );

  const deleteEntry = async (id: number) => {
    if (!db) return;
    try {
      const updateAt = new Date().toISOString();
      const deletedAt = new Date().toISOString();
      await db.runAsync("UPDATE entries SET updated_at = ?, deleted_at = ?, synced = 0 WHERE id = ?", [
        updateAt,
        deletedAt,
        id,
      ]);
      setDataUpdated(!dataUpdated);
      setSelectedEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const updateEntry = async (editingText: string, editingId: number) => {
    if (!db) return;
    try {
      const updateAt = new Date().toISOString();
      const trimmedEditingText = editingText.trim();
      await db.runAsync(`UPDATE entries SET text = ?, updated_at = ?, synced = 0 WHERE id = ?`, [
        trimmedEditingText,
        updateAt,
        editingId,
      ]);
      setDataUpdated(!dataUpdated);
      setSelectedEntries((prev) =>
        prev.map((entry) => (entry.id === editingId ? { ...entry, text: editingText } : entry))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrashPress = async () => {
    if (!db) return;
    const deletedEntries: Entry[] = await db.getAllAsync(
      "SELECT * FROM entries WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
    );
    setIsTrash(true);
    setModalVisible(true);
    setSelectedEntries(deletedEntries);
  };

  const restoreFromTrash = async (id: number) => {
    if (!db) return;
    try {
      const updateAt = new Date().toISOString();
      await db.runAsync("UPDATE entries SET updated_at = ?, deleted_at = ?, synced = 0 WHERE id = ?", [
        updateAt,
        null,
        id,
      ]);
      setDataUpdated(!dataUpdated);
      setSelectedEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ borderBottomWidth: 2, marginBottom: 10, flexDirection: "row", alignItems: "center" }}>
        <Text
          style={
            isJapanese ? { fontSize: 22, fontFamily: "RocknRollOne" } : { fontSize: 22, fontFamily: "Kanit" }
          }
        >
          {i18n.t("memolog")}
        </Text>
        <TouchableOpacity onPress={() => router.navigate("/settings")}>
          <Ionicons name="settings-outline" size={24} color="black" style={{ paddingLeft: 10 }} />
        </TouchableOpacity>
      </View>
      {fetchedData && fetchedData.length > 0 && (
        <SectionList
          sections={sections}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          style={{ flex: 0.7 }}
        />
      )}
      <View
        style={{
          flex: 0.3,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "whitesmoke",
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => handleTrashPress()}
        >
          <Ionicons name="trash-outline" size={26} color="black" />
        </TouchableOpacity>
      </View>
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
  container: {
    paddingHorizontal: 20,
    marginTop: 60,
    flex: 1,
  },
  collapseButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: 20,
    paddingLeft: 5,
    color: "#262626",
    fontFamily: "Poppins",
  },
});

// const mockData = [
//   {
//     year: "2024",
//     months: [
//       {
//         month: "2024-09",
//         dates: [
//           {
//             date: "2024-09-15",
//             entries: [
//               { id: 1, date: "2024-09-15", text: "今日のエントリー" },
//               { id: 2, date: "2024-09-15", text: "別のエントリー" },
//             ],
//           },
//           {
//             date: "2024-09-10",
//             entries: [{ id: 3, date: "2024-09-10", text: "ミーティングについて" }],
//           },
//         ],
//       },
//       {
//         month: "2024-08",
//         dates: [
//           {
//             date: "2024-08-25",
//             entries: [{ id: 4, date: "2024-08-25", text: "夏休みの思い出" }],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     year: "2023",
//     months: [
//       {
//         month: "2023-12",
//         dates: [
//           {
//             date: "2023-12-31",
//             entries: [{ id: 5, date: "2023-12-31", text: "大晦日の計画" }],
//           },
//         ],
//       },
//       {
//         month: "2023-11",
//         dates: [
//           {
//             date: "2023-11-05",
//             entries: [{ id: 6, date: "2023-11-05", text: "プロジェクト締め切り" }],
//           },
//         ],
//       },
//     ],
//   },
// ];

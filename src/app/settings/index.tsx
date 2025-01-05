import SettingsModal from "@/src/components/SettingModal";
import { useAuthContext } from "@/src/contexts/AuthContext";
import { useLanguageContext } from "@/src/contexts/LanguageContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { useDatabase } from "@/src/hooks/useDatabase";
import { ExportGDrive, handleFileSelect, ImportGDrive } from "@/src/utils/GDriveUtils";
import i18n from "@/src/utils/i18n";
import { themeColors } from "@/src/utils/theme";
import { Entry } from "@/types";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Toast from "react-native-root-toast";
import { useDataContext } from "../../contexts/DataContext";

interface SettingsListType {
  id: number;
  label: string;
  icon?: any;
}

interface Files {
  name: string;
  id: string;
}

const SettingsScreen = () => {
  const db = useDatabase();
  const [files, setFiles] = useState<Files[] | null>(null);
  const { dataUpdated, setDataUpdated } = useDataContext();
  const { session, isProUser } = useAuthContext();
  const { theme } = useThemeContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { isJapanese } = useLanguageContext();

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const data = [
    { id: 1, label: `${i18n.t("account")}` },
    { id: 2, label: `${i18n.t("customization")}` },
    { id: 3, label: `${i18n.t("theme")}` },
    { id: 4, label: `${i18n.t("faq")}`, icon: "question" },
    { id: 5, label: `${i18n.t("privacy_policy")}`, icon: "link" },
    { id: 6, label: `${i18n.t("terms_of_use")}`, icon: "link" },
    { id: 7, label: `${i18n.t("export")}` },
    { id: 8, label: `${i18n.t("import")}` },
  ];

  const handlePress = async (id: number) => {
    switch (id) {
      case 1:
        if (session) {
          router.push("/settings/account");
        } else {
          router.push("/settings/(auth)/register");
        }
        break;
      case 2:
        router.push("/settings/customization");
        break;
      case 3:
        setIsModalVisible(true);
        break;
      case 4:
        router.push("/settings/faq");
        break;
      case 5:
        try {
          Alert.alert(i18n.t("external_link"), i18n.t("external_link_message"), [
            {
              text: i18n.t("cancel"),
              style: "cancel",
            },
            {
              text: i18n.t("continue"),
              onPress: async () => await Linking.openURL("https://sites.google.com/view/memolog-minute/privacy-policy"),
            },
          ]);
        } catch (e) {
          console.error(e);
        }
        break;
      case 6:
        try {
          Alert.alert("External Link", "You are about to leave the app and visit an external site.", [
            {
              text: i18n.t("cancel"),
              style: "cancel",
            },
            {
              text: i18n.t("continue"),
              onPress: async () => await Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"),
            },
          ]);
        } catch (e) {
          console.error(e);
        }
        break;
      case 7:
        if (!db) {
          Alert.alert("database initialize error");
        } else {
          if (!session) {
            Toast.show(i18n.t("sign_up_required"), {
              position: Toast.positions.CENTER,
            });
            router.push("/settings/(auth)/register");
          } else {
            const exportedFileName = await ExportGDrive(db);
            if (exportedFileName) {
              Alert.alert(i18n.t("exportFinished", { fileName: exportedFileName }));
            }
          }
        }
        break;
      case 8:
        if (!session) {
          Toast.show(i18n.t("sign_up_required"), {
            position: Toast.positions.CENTER,
          });
          router.push("/settings/(auth)/register");
        } else {
          const importedFiles = await ImportGDrive();
          if (importedFiles) {
            setFiles(importedFiles);
          }
        }
        break;
    }
  };

  const restoreDatabase = async (dataList: Entry[]) => {
    try {
      if (!db) {
        Alert.alert("database initialize error");
      } else {
        const placeholders = dataList.map(() => "(?,?,?,?,?,?,?,?)").join(",");
        const values = dataList.reduce(
          (acc, data) => acc.concat([data.id, data.created_at, data.updated_at, data.deleted_at, data.date, data.text, data.user_id, 0]),
          [] as (string | number | null)[]
        );
        await db.withTransactionAsync(async () => {
          await db.runAsync(`INSERT INTO entries (id, created_at, updated_at, deleted_at, date, text, user_id, synced) VALUES ${placeholders}`, values);
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
    if (importedDataList) {
      restoreDatabase(importedDataList);
      Alert.alert(i18n.t("importFinished", { fileName: name }));
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: SettingsListType }) => (
      <TouchableOpacity onPress={() => handlePress(item.id)} style={{ paddingLeft: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 30 }}>
              {item.id === 1 ? (
                <Feather name="user" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
              ) : item.id === 2 ? (
                <MaterialCommunityIcons name="wrench-outline" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
              ) : item.id === 3 ? (
                <MaterialCommunityIcons name="theme-light-dark" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
              ) : item.id === 7 ? (
                <FontAwesome6
                  name="file-export"
                  size={22}
                  color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText}
                  style={{ paddingLeft: 4 }}
                />
              ) : item.id === 8 ? (
                <FontAwesome6
                  name="file-import"
                  size={22}
                  color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText}
                  style={{ paddingLeft: 4 }}
                />
              ) : (
                <Fontisto
                  name={item.icon}
                  size={20}
                  color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText}
                  style={{ paddingLeft: 4 }}
                />
              )}
            </View>
            <Text
              style={[
                { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText },
                isJapanese ? [styles.label, { fontFamily: "NotoSansJP" }] : styles.label,
              ]}
            >
              {item.label}
            </Text>
          </View>
          <Entypo name="chevron-small-right" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.secondaryText} />
        </View>
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
              <TouchableOpacity onPress={() => handleFileSelectWithClear(item.id, item.name)} style={styles.file}>
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

  useEffect(() => {
    if (!session) {
      setFiles(null);
    }
  }, [session]);

  useEffect(() => {
    if (theme === "dark") {
      setStatusBarStyle("light");
    } else if (theme === "light") {
      setStatusBarStyle("dark");
    }
  }, [theme]);

  return (
    <View style={{ flex: 1, padding: 30, backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }}>
      {!isProUser ? (
        <View
          style={{
            backgroundColor: "#ECEFF1",
            paddingVertical: 20,
            paddingHorizontal: 20,
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 4,
            shadowOpacity: 0.1,
            marginBottom: 15,
          }}
        >
          <FontAwesome6 name="face-meh" size={50} color="#9E9E9E" />
          <View style={{ marginRight: 60 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>{i18n.t("freePlan")}</Text>
            {/* <Text style={{ fontSize: 12 }}>{i18n.t("monthlySubscription")}</Text> */}
          </View>
          <View style={{ backgroundColor: "white", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, justifyContent: "center" }}>
            <TouchableOpacity onPress={() => router.push("/settings/subscriptionPlans")}>
              <Text>{i18n.t("seePlan")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: "#FFF3E0",
            paddingVertical: 20,
            paddingHorizontal: 20,
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 4,
            shadowOpacity: 0.1,
            marginBottom: 15,
          }}
        >
          <FontAwesome6 name="face-smile-wink" size={50} color="#FF9800" />
          <View style={{ marginRight: 40 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>Pro🔥</Text>
            <Text style={{ fontSize: 12 }}>Monthly subscription</Text>
          </View>
          <View style={{ backgroundColor: "white", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, justifyContent: "center" }}>
            <TouchableOpacity onPress={() => router.push("/settings/subscriptionPlans")}>
              <Text>See plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <FlashList
        data={data}
        renderItem={renderItem}
        estimatedItemSize={60}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "silver" }} />}
        ListFooterComponent={ListFooterComponent()}
      />
      {/* <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setIsModalVisible(false)} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <TouchableWithoutFeedback>
              <View style={{ height: "25%", backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }}>
                <AppearanceSettings />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal> */}
      <SettingsModal isModalVisible={isModalVisible} onClose={handleClose} type="appearance" />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  file: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
  },
});

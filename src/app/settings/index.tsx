import PlatformBannerAd from "@/src/components/PlatformBannerAd";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { db } from "@/src/database/db";
import { Entry } from "@/src/database/types";
import { ExportGDrive, handleFileSelect, ImportGDrive } from "@/src/utils/GDriveUtils";
import i18n from "@/src/utils/i18n";
import { removeAds, restorePurchase } from "@/src/utils/removeAds";
import { themeColors } from "@/src/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDataContext } from "../../contexts/DataContext";

interface Files {
  name: string;
  id: string;
}

const SettingsScreen = () => {
  const [files, setFiles] = useState<Files[] | null>(null);
  const { dataUpdated, setDataUpdated } = useDataContext();
  const { theme } = useThemeContext();
  const [isAdsRemoved, setIsAdsRemoved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdsStatus = async () => {
      const value = await AsyncStorage.getItem("isAdsRemoved");
      if (value === "true") {
        setIsAdsRemoved(true);
      }
    };
    checkAdsStatus();
  }, [isAdsRemoved]);

  const restoreDatabase = async (dataList: Entry[]) => {
    try {
      if (!db) {
        Alert.alert("database initialize error");
      } else {
        const placeholders = dataList.map(() => "(?,?,?,?,?,?)").join(",");
        const values = dataList.reduce(
          (acc, data) => acc.concat([data.id, data.created_at, data.updated_at, data.deleted_at, data.date, data.text]),
          [] as (string | number | null)[]
        );
        await db.withTransactionAsync(async () => {
          await db!.runAsync(`INSERT OR IGNORE INTO entries (id, created_at, updated_at, deleted_at, date, text) VALUES ${placeholders}`, values);
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
      if (Platform.OS === "android") {
        Alert.alert(i18n.t("importFinishedAndroid", { fileName: name }));
      } else {
        Alert.alert(i18n.t("importFinished", { fileName: name }));
      }
    }
  };

  useEffect(() => {
    if (theme === "dark") {
      setStatusBarStyle("light");
    } else if (theme === "light") {
      setStatusBarStyle("dark");
    }
  }, [theme]);

  const openCustomization = () => {
    router.push("/settings/customization");
  };

  const openFAQ = () => {
    router.push("/settings/faq");
  };

  const openPrivacyPolicy = () => {
    Alert.alert(i18n.t("external_link"), i18n.t("external_link_message"), [
      {
        text: i18n.t("cancel"),
        style: "cancel",
      },
      {
        text: i18n.t("continue"),
        onPress: async () => await Linking.openURL("https://www.ezgna.com/privacypolicy"),
      },
    ]);
  };

  const openTermsOfUse = () => {
    Alert.alert(i18n.t("external_link"), i18n.t("external_link_message"), [
      {
        text: i18n.t("cancel"),
        style: "cancel",
      },
      {
        text: i18n.t("continue"),
        onPress: async () => await Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"),
      },
    ]);
  };

  const handleExport = async () => {
    if (!db) {
      console.error("database initialize error");
      return;
    } else {
      const exportedFileName = await ExportGDrive(db);
      if (exportedFileName) {
        if (Platform.OS === "android") {
          Alert.alert(i18n.t("exportFinishedAndroid", { fileName: exportedFileName }));
        } else {
          Alert.alert(i18n.t("exportFinished", { fileName: exportedFileName }));
        }
      }
    }
  };

  const handleImport = async () => {
    const importedFiles = await ImportGDrive();
    if (importedFiles) {
      setFiles(importedFiles);
    }
  };

  const handleRemoveAds = async () => {
    setLoading(true);
    const success = await removeAds();
    if (success) {
      setIsAdsRemoved(true);
      Alert.alert(i18n.t("purchase_success"));
      console.log("The ads were removed!");
    }
    setLoading(false);
  };

  const handleRestoreAds = async () => {
    setLoading(true);
    const success = await restorePurchase();
    if (success) {
      setIsAdsRemoved(true);
      Alert.alert(i18n.t("restore_success"));
      console.log("Restored successfully! Ads will be removed.");
    }
    setLoading(false);
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.optionContainer}>
          <Pressable style={styles.option} onPress={openCustomization}>
            <Ionicons name="options-outline" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
            <Text style={[styles.optionText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{i18n.t("customization")}</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={openFAQ}>
            <MaterialCommunityIcons name="frequently-asked-questions" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
            <Text style={[styles.optionText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{i18n.t("faq")}</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={openPrivacyPolicy}>
            <Feather name="external-link" size={22} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
            <Text style={[styles.optionText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{i18n.t("privacy_policy")}</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={openTermsOfUse}>
            <Feather name="external-link" size={22} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
            <Text style={[styles.optionText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{i18n.t("terms_of_use")}</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={handleExport}>
            <Ionicons name="cloud-upload-outline" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
            <Text style={[styles.optionText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{i18n.t("export")}</Text>
          </Pressable>

          <Pressable style={[styles.option, isAdsRemoved && { borderBottomWidth: 0 }]} onPress={handleImport}>
            <Ionicons name="cloud-upload-outline" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
            <Text style={[styles.optionText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{i18n.t("import")}</Text>
          </Pressable>

          {!isAdsRemoved && (
            <Pressable style={styles.option} onPress={handleRemoveAds} disabled={loading}>
              <MaterialIcons name="highlight-remove" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
              {loading ? (
                <ActivityIndicator size="small" color={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText} style={{ marginLeft: 20 }} />
              ) : (
                <Text style={[styles.optionText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{i18n.t("remove_ads")} </Text>
              )}
            </Pressable>
          )}

          {!isAdsRemoved && (
            <Pressable style={[styles.option, { borderBottomWidth: 0 }]} onPress={handleRestoreAds} disabled={loading}>
              <MaterialCommunityIcons name="refresh" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
              {loading ? (
                <ActivityIndicator size="small" color={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText} style={{ marginLeft: 20 }} />
              ) : (
                <Text style={[styles.optionText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{i18n.t("restore_purchase")}</Text>
              )}
            </Pressable>
          )}

          {files && (
            <>
              <Text style={{ color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText, fontSize: 20, marginVertical: 10 }}>
                Tap the file you want to import
              </Text>
              {files.map((item) => (
                <Pressable key={item.id} onPress={() => handleFileSelectWithClear(item.id, item.name)} style={styles.file}>
                  <MaterialCommunityIcons name="file-document" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
                  <Text style={[styles.optionText, { color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }]}>{item.name}</Text>
                </Pressable>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {!isAdsRemoved && <PlatformBannerAd />}
    </>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
  },
  optionContainer: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  optionText: {
    marginLeft: 20,
    fontSize: 16,
  },
  file: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
});

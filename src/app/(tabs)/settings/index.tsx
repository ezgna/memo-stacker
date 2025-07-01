import CustomText from "@/src/components/CustomText";
import PlatformBannerAd from "@/src/components/PlatformBannerAd";
import { useAdsContext } from "@/src/contexts/AdsContext";
import { useDataContext } from "@/src/contexts/DataContext";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { db } from "@/src/database/db";
import { Entry } from "@/src/database/types";
import { ExportGDrive, handleFileSelect, ImportGDrive } from "@/src/utils/GDriveUtils";
import i18n from "@/src/utils/i18n";
import { getStep, setStep } from "@/src/utils/onboarding";
import { removeAds, restorePurchase } from "@/src/utils/removeAds";
import { themeColors } from "@/src/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const { initializeAds } = useAdsContext();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const s = await getStep();
          if (s === 4) {
            const title = i18n.t("onboarding.step5.title");
            const lines = i18n.t("onboarding.step5.description", { returnObjects: true }) as string[];
            const message = lines.join("\n");
            setTimeout(() => {
              Alert.alert(
                title,
                message,
                [
                  {
                    text: "OK",
                    onPress: async () => {
                      await setStep(5);

                      if (Platform.OS !== "android") {
                        setTimeout(() => {
                          const nextTitle = i18n.t("onboarding.step6.title");
                          const nextLines = i18n.t("onboarding.step6.description", { returnObjects: true }) as string[];
                          const nextMessage = nextLines.join("\n");

                          Alert.alert(
                            nextTitle,
                            nextMessage,
                            [
                              {
                                text: "OK",
                                onPress: async () => {
                                  setTimeout(async () => {
                                    await setStep(6);
                                    await initializeAds();
                                  }, 500);
                                },
                              },
                            ],
                            { cancelable: false }
                          );
                        }, 500);
                      }
                    },
                  },
                ],
                { cancelable: false }
              );
            }, 1000);
          }
        } catch (e) {
          console.error(e);
        }
      })();
    }, [])
  );

  // useEffect(() => {
  //   (async () => {
  //     const s = await getStep();
  //     if (s === 3) {
  //       const title = i18n.t("onboarding.step5.title");
  //       const lines = i18n.t("onboarding.step5.description", { returnObjects: true }) as string[];
  //       const message = lines.join("\n");
  //       setTimeout(() => {
  //         Alert.alert(
  //           title,
  //           message,
  //           [
  //             {
  //               text: "OK",
  //               onPress: async () => {
  //                 await setStep(4);

  //                 if (Platform.OS !== "android") {
  //                   setTimeout(() => {
  //                     const nextTitle = i18n.t("onboarding.step6.title");
  //                     const nextLines = i18n.t("onboarding.step6.description", { returnObjects: true }) as string[];
  //                     const nextMessage = nextLines.join("\n");

  //                     Alert.alert(
  //                       nextTitle,
  //                       nextMessage,
  //                       [
  //                         {
  //                           text: "OK",
  //                           onPress: async () => {
  //                             setTimeout(async () => {
  //                               await setStep(5);
  //                               await initializeAds();
  //                             }, 500);
  //                           },
  //                         },
  //                       ],
  //                       { cancelable: false }
  //                     );
  //                   }, 500);
  //                 }
  //               },
  //             },
  //           ],
  //           { cancelable: false }
  //         );
  //       }, 1000);
  //     }
  //   })();
  // }, []);

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
    } else {
      console.log("No active entitlement found for remove_ads_access.");
      Alert.alert(i18n.t("restore_false"));
    }
    setLoading(false);
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.optionContainer,
              {
                backgroundColor: theme === "dark" ? "#2a2a2a" : "#fff",
                shadowOpacity: theme === "dark" ? 0.2 : 0.1,
              },
            ]}
          >
            <Pressable style={({ pressed }) => [styles.option, { opacity: pressed ? 0.6 : 1 }]} onPress={openCustomization}>
              <Ionicons name="options-outline" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
              <CustomText style={styles.optionText}>{i18n.t("customization")}</CustomText>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.option, { opacity: pressed ? 0.6 : 1 }]} onPress={openFAQ}>
              <MaterialCommunityIcons name="frequently-asked-questions" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
              <CustomText style={styles.optionText}>{i18n.t("faq")}</CustomText>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.option, { opacity: pressed ? 0.6 : 1 }]} onPress={openPrivacyPolicy}>
              <Feather name="external-link" size={22} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
              <CustomText style={styles.optionText}>{i18n.t("privacy_policy")}</CustomText>
            </Pressable>

            {Platform.OS === "ios" && (
              <Pressable style={({ pressed }) => [styles.option, { opacity: pressed ? 0.6 : 1 }]} onPress={openTermsOfUse}>
                <Feather name="external-link" size={22} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
                <CustomText style={styles.optionText}>{i18n.t("terms_of_use")}</CustomText>
              </Pressable>
            )}

            <Pressable style={({ pressed }) => [styles.option, { opacity: pressed ? 0.6 : 1 }]} onPress={handleExport}>
              <Ionicons name="cloud-upload-outline" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
              <CustomText style={styles.optionText}>{i18n.t("export")}</CustomText>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.option, isAdsRemoved && { borderBottomWidth: 0 }, { opacity: pressed ? 0.6 : 1 }]} onPress={handleImport}>
              <Ionicons name="cloud-upload-outline" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
              <CustomText style={styles.optionText}>{i18n.t("import")}</CustomText>
            </Pressable>

            {!isAdsRemoved && (
              <Pressable style={({ pressed }) => [styles.option, { opacity: pressed ? 0.6 : 1 }]} onPress={handleRemoveAds} disabled={loading}>
                <MaterialIcons name="highlight-remove" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
                {loading ? (
                  <ActivityIndicator size="small" color={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText} style={{ marginLeft: 20 }} />
                ) : (
                  <CustomText style={styles.optionText}>{i18n.t("remove_ads")}</CustomText>
                )}
              </Pressable>
            )}

            {!isAdsRemoved && (
              <Pressable style={({ pressed }) => [styles.option, { borderBottomWidth: 0, opacity: pressed ? 0.6 : 1 }]} onPress={handleRestoreAds} disabled={loading}>
                <MaterialCommunityIcons name="refresh" size={24} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
                {loading ? (
                  <ActivityIndicator size="small" color={theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText} style={{ marginLeft: 20 }} />
                ) : (
                  <CustomText style={styles.optionText}>{i18n.t("restore_purchase")}</CustomText>
                )}
              </Pressable>
            )}
          </View>
          {files && (
            <>
              <CustomText style={{ fontSize: 16, marginTop: 24, marginBottom: 6 }}>{i18n.t("import_file_prompt")}</CustomText>
              {files.map((item) => (
                <Pressable key={item.id} onPress={() => handleFileSelectWithClear(item.id, item.name)} style={({ pressed }) => [styles.file, { opacity: pressed ? 0.6 : 1 }]}>
                  <MaterialCommunityIcons name="file-document" size={20} color={theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.primaryText} />
                  <CustomText style={{ marginLeft: 10, fontSize: 16, lineHeight: 22 }}>{item.name}</CustomText>
                </Pressable>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      {!isAdsRemoved && <PlatformBannerAd />}
    </>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  optionContainer: {
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 18,
  },
  file: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
});

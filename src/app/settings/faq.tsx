import CustomText from "@/src/components/CustomText";
import PlatformBannerAd from "@/src/components/PlatformBannerAd";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import i18n from "@/src/utils/i18n";
import { themeColors } from "@/src/utils/theme";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Collapsible from "react-native-collapsible";

const faq = () => {
  const { theme } = useThemeContext();
  const [isAdsRemoved, setIsAdsRemoved] = useState(false);

  useEffect(() => {
    const checkAdsStatus = async () => {
      const value = await AsyncStorage.getItem("isAdsRemoved");
      if (value === "true") {
        setIsAdsRemoved(true);
      }
    };
    checkAdsStatus();
  }, []);

  const data = [
    { id: 1, question: `${i18n.t("memoLog_overview_question")}`, answer: `${i18n.t("memoLog_overview_answer")}` },
    { id: 2, question: `${i18n.t("view_notes_home_question")}`, answer: `${i18n.t("view_notes_home_answer")}` },
    { id: 3, question: `${i18n.t("view_notes_tabs_question")}`, answer: `${i18n.t("view_notes_tabs_answer")}` },
    { id: 4, question: `${i18n.t("search_notes_question")}`, answer: `${i18n.t("search_notes_answer")}` },
    { id: 5, question: `${i18n.t("edit_delete_notes_question")}`, answer: `${i18n.t("edit_delete_notes_answer")}` },
    { id: 6, question: `${i18n.t("security_info_question")}`, answer: `${i18n.t("security_info_answer")}` },
    { id: 7, question: `${i18n.t("device_transfer_question")}`, answer: `${i18n.t("device_transfer_answer")}` },
    { id: 8, question: `${i18n.t("language_settings_question")}`, answer: `${i18n.t("language_settings_answer")}` },
    { id: 9, question: `${i18n.t("remove_ads_question")}`, answer: `${i18n.t("remove_ads_answer")}` },
  ];

  const initialCollapsedItems = data.reduce<Record<number, boolean>>((acc, item) => {
    acc[item.id] = true;
    return acc;
  }, {});

  const [collapsedItems, setCollapsedItems] = useState<{ [key: number]: boolean }>(initialCollapsedItems);

  const toggleCollapse = (id: number) => {
    setCollapsedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const CollapseIndicator = ({ id }: { id: number }) => <AntDesign name={collapsedItems[id] ? "down" : "up"} size={12} color={collapsedItems[id] ? "darkgray" : "#4169E1"} />;

  return (
    <>
      <View
        style={{
          flex: 1,
          paddingTop: 10,
          paddingBottom: 50,
          backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background,
        }}
      >
        <ScrollView>
          {data.map((item) => (
            <Pressable
              onPress={() => toggleCollapse(item.id)}
              key={item.id}
              style={[
                {
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  borderBottomColor: "gainsboro",
                },
                !collapsedItems[item.id] && { backgroundColor: theme === "dark" ? "#24313A" : "#EBF4FA" },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <CustomText style={styles.questionText}>{item.question}</CustomText>
                <CollapseIndicator id={item.id} />
              </View>
              <Collapsible collapsed={collapsedItems[item.id]}>
                <CustomText style={styles.answerText}>{item.answer}</CustomText>
              </Collapsible>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {!isAdsRemoved && <PlatformBannerAd />}
    </>
  );
};

export default faq;

const styles = StyleSheet.create({
  questionText: {
    fontSize: 18,
    color: "#6495ED",
  },
  answerText: {
    fontSize: 18,
    paddingTop: 20,
    lineHeight: 30,
  },
});

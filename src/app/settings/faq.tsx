import { View, Text, Button, ScrollView } from "react-native";
import React, { useState } from "react";
import Collapsible from "react-native-collapsible";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { themeColors } from "@/src/utils/theme";
import i18n from "@/src/utils/i18n";

const faq = () => {
  const { theme } = useThemeContext();

  const data = [
    { id: 1, question: `${i18n.t("memoLog_overview_question")}`, answer: `${i18n.t("memoLog_overview_answer")}` },
    { id: 2, question: `${i18n.t("view_notes_home_question")}`, answer: `${i18n.t("view_notes_home_answer")}` },
    { id: 3, question: `${i18n.t("view_notes_tabs_question")}`, answer: `${i18n.t("view_notes_tabs_answer")}` },
    { id: 4, question: `${i18n.t("search_notes_question")}`, answer: `${i18n.t("search_notes_answer")}` },
    { id: 5, question: `${i18n.t("edit_delete_notes_question")}`, answer: `${i18n.t("edit_delete_notes_answer")}` },
    { id: 6, question: `${i18n.t("security_info_question")}`, answer: `${i18n.t("security_info_answer")}` },
    { id: 7, question: `${i18n.t("device_transfer_question")}`, answer: `${i18n.t("device_transfer_answer")}` },
    // { id: 8, question: `${i18n.t("sign_up_login_question")}`, answer: `${i18n.t("sign_up_login_answer")}` },
    // { id: 9, question: `${i18n.t("email_recovery_question")}`, answer: `${i18n.t("email_recovery_answer")}` },
    // { id: 10, question: `${i18n.t("password_recovery_question")}`, answer: `${i18n.t("password_recovery_answer")}` },
    { id: 11, question: `${i18n.t("language_settings_question")}`, answer: `${i18n.t("language_settings_answer")}` },
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
    <View style={{ flex: 1, paddingTop: 10, paddingBottom: 50, backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }}>
      <ScrollView>
        {data.map((item) => (
          <TouchableOpacity
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
              <Text style={{ fontSize: 18, color: "#6495ED" }}>{item.question}</Text>
              <CollapseIndicator id={item.id} />
            </View>
            <Collapsible collapsed={collapsedItems[item.id]}>
              <Text style={{ fontSize: 18, paddingTop: 20, lineHeight: 30, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>
                {item.answer}
              </Text>
            </Collapsible>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default faq;

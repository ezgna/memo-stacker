import { FlashList } from "@shopify/flash-list";
import React, { FC, useCallback, useEffect } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import { EditActionSheet } from "./EditActionSheet";
import i18n, { isJapanese } from "@/src/utils/i18n";
import { Entry } from "@/types";
import { useThemeContext } from "../contexts/ThemeContext";
import { themeColors } from "../utils/theme";

interface FlashListCompoProps {
  data: Entry[];
  onDelete: (id: number) => void;
  onUpdate: (text: string, id: number) => void;
  editingId: number | null;
  isTrash?: boolean;
  onRestore?: (id: number) => void;
}

export const FlashListCompo: FC<FlashListCompoProps> = ({ data, onDelete, onUpdate, editingId, isTrash, onRestore }) => {
  const { theme } = useThemeContext();

  const sortedData = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const renderItem = ({ item }: { item: Entry }) => (
    <View
      style={[
        {
          borderWidth: 1,
          marginBottom: 13,
          borderRadius: 5,
          paddingVertical: 12,
          paddingHorizontal: 15,
        },
        editingId === item.id
          ? { borderColor: theme === "dark" ? "darkgray" : "dimgray" }
          : { borderColor: theme === "dark" ? themeColors.dark.border : themeColors.light.border },
      ]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 12, marginBottom: 10, color: theme === "dark" ? themeColors.dark.secondaryText : themeColors.light.secondaryText }}>
          {new Date(item.created_at).toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Text>
        <EditActionSheet
          deleteEntry={() => onDelete(item.id)}
          updateEntry={() => onUpdate(item.text, item.id)}
          isTrash={isTrash}
          restoreEntry={onRestore ? () => onRestore(item.id) : undefined}
        />
      </View>
      {/* {Platform.OS === "ios" ? (
        <TextInput
          editable={false}
          multiline
          scrollEnabled={false}
          style={
            isJapanese
              ? { fontSize: 18, color: "raisinblack", fontFamily: "NotoSansJP" }
              : { fontSize: 18, color: "raisinblack" }
          }
        >
          {item.text}
        </TextInput>
      ) : (
        <Text style={{ fontSize: 18, color: "raisinblack" }} selectable={true}>
          {item.text}
        </Text>
      )} */}
      <Text style={{ fontSize: 18, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }} selectable={true}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {isTrash && data.length === 0 ? (
        <Text style={{ textAlign: "center", fontSize: 16, color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText }}>{`${i18n.t(
          "trashEmpty"
        )}`}</Text>
      ) : (
        <FlashList
          data={sortedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={80}
          showsVerticalScrollIndicator={false}
          extraData={editingId}
        />
      )}
    </View>
  );
};

import { FlashList } from "@shopify/flash-list";
import React, { FC } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import { EditActionSheet } from "./EditActionSheet";

interface Entry {
  created_at: string;
  date: string;
  text: string;
  id: number;
  user_id: string;
}

interface FlashListCompoProps {
  data: Entry[];
  onDelete: (id: number) => void;
  onUpdate: (text: string, id: number) => void;
}

export const FlashListCompo: FC<FlashListCompoProps> = ({ data, onDelete, onUpdate }) => {
  const renderItem = ({ item }: { item: Entry }) => (
    <View
      style={{
        borderWidth: 1,
        marginBottom: 13,
        borderRadius: 5,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderColor: "gainsboro",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 12, color: "grey", marginBottom: 10 }}>{item.created_at}</Text>
        <EditActionSheet
          deleteEntry={() => onDelete(item.id)}
          updateEntry={() => onUpdate(item.text, item.id)}
        />
      </View>
      {Platform.OS === "ios" ? (
        <TextInput editable={false} multiline scrollEnabled={false} style={{ fontSize: 18, color: "raisinblack" }}>
          {item.text}
        </TextInput>
      ) : (
        <Text style={{ fontSize: 18, color: "raisinblack" }} selectable={true}>
          {item.text}
        </Text>
      )}
    </View>
  );

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      estimatedItemSize={80}
      showsVerticalScrollIndicator={false}
    />
  );
};

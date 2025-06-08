import { View, Text, Modal, TouchableWithoutFeedback } from "react-native";
import React, { FC } from "react";
import { themeColors } from "../utils/theme";
import { useThemeContext } from "../contexts/ThemeContext";
import AppearancePickers from "./AppearancePickers";
import LanguagePickers from "./LanguagePickers";
import FontPickers from "./FontPickers";

type SettingsModalProps = {
  isModalVisible: boolean;
  onClose: () => void;
  type: "language" | "theme" | "font";
};

const SettingsModal: FC<SettingsModalProps> = ({ isModalVisible, onClose, type }) => {
  const { theme } = useThemeContext();

  return (
    <Modal visible={isModalVisible} transparent={true} onRequestClose={() => onClose()} animationType="fade">
      <TouchableWithoutFeedback onPress={() => onClose()}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <TouchableWithoutFeedback>
            <View style={{ height: "25%", backgroundColor: theme === "dark" ? themeColors.dark.background : themeColors.light.background }}>
              {type === "theme" ? <AppearancePickers /> : type === "language" ? <LanguagePickers /> : type === "font" ? <FontPickers /> : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SettingsModal;

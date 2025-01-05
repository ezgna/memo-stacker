import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface SettingsContextType {
  autoFocus: boolean;
  updateAutoFocus: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [autoFocus, setAutoFocus] = useState(false);

  useEffect(() => {
    (async () => {
      const savedAutoFocus = await AsyncStorage.getItem("autoFocus");
      if (savedAutoFocus !== null) {
        setAutoFocus(JSON.parse(savedAutoFocus));
      }
    })();
  }, []);

  const updateAutoFocus = async (value: boolean) => {
    await AsyncStorage.setItem("autoFocus", JSON.stringify(value));
    setAutoFocus(value);
  };

  return <SettingsContext.Provider value={{ autoFocus, updateAutoFocus }}>{children}</SettingsContext.Provider>;
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("context error");
  }
  return context;
};

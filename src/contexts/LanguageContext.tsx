import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import i18n from "../utils/i18n";

type selectedLanguageType = "system" | "ja" | "en";

interface LanguageContextType {
  language: "ja" | "en";
  selectedLanguage: selectedLanguageType;
  toggleLanguage: (newLanguage: selectedLanguageType) => Promise<void>;
  isJapanese: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"ja" | "en">("en");
  const [selectedLanguage, setSelectedLanguage] = useState<selectedLanguageType>("system");
  const isJapanese = language === 'ja';

  const ensureSupportedLanguage = () => {
    const deviceLanguage = getLocales()[0]?.languageCode || "";
    const fallbackLanguage = "en";

    setLanguage(["ja", "en"].includes(deviceLanguage) ? (deviceLanguage as "ja" | "en") : fallbackLanguage);
  };

  useEffect(() => {
    const loadUserlanguagePreference = async () => {
      const savedlanguage = (await AsyncStorage.getItem("selectedLanguage")) as selectedLanguageType | null;
      setSelectedLanguage(savedlanguage || "system");
    };
    loadUserlanguagePreference();
  }, []);

  useEffect(() => {
    const updateLanguage = () => {
      if (selectedLanguage === "system") {
        ensureSupportedLanguage();
      } else {
        setLanguage(selectedLanguage);
      }
    };
    updateLanguage();
  }, [selectedLanguage]);

  useEffect(() => {
    i18n.locale = language;
    // console.log(i18n.locale)
    // console.log(language)
  }, [language]);

  const toggleLanguage = async (newLanguage: selectedLanguageType) => {
    setSelectedLanguage(newLanguage);
    await AsyncStorage.setItem("selectedLanguage", newLanguage);
  };

  return <LanguageContext.Provider value={{ language, selectedLanguage, toggleLanguage, isJapanese }}>{children}</LanguageContext.Provider>;
};

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("language context error");
  }
  return context;
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

type theme = "system" | "light" | "dark";

interface ThemeContextType {
  theme: "light" | "dark";
  selectedTheme: theme;
  toggleTheme: (newTheme: "system" | "light" | "dark") => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');
  const [selectedTheme, setSelectedTheme] = useState<theme>('system');

  useEffect(() => {
    const loadUserThemePreference = async () => {
      const savedTheme = (await AsyncStorage.getItem("selectedTheme")) as theme | null;
      setSelectedTheme(savedTheme || "system");
    };
    loadUserThemePreference();
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      if (selectedTheme === "system") {
        setTheme(Appearance.getColorScheme() || "light");
      } else if (selectedTheme === "dark" || selectedTheme === "light") {
        setTheme(selectedTheme);
      } else {
        console.log("unknown error");
      }
    };
    updateTheme();

    if (selectedTheme === "system") {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setTheme(colorScheme || "light");
      });
      return () => subscription.remove();
    }
  }, [selectedTheme]);

  const toggleTheme = async (newTheme: theme) => {
    setSelectedTheme(newTheme);
    await AsyncStorage.setItem("selectedTheme", newTheme);
  };

  return <ThemeContext.Provider value={{ theme, selectedTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

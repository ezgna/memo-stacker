import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

interface ThemeContextType {
  theme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(()=>{
    const subscription = Appearance.addChangeListener(({colorScheme})=>{
      setTheme(colorScheme || 'light')
    })
    return () => subscription.remove();
  }, [])

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

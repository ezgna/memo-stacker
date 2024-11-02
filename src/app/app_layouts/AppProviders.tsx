import { AuthProvider } from "@/src/contexts/AuthContext";
import { DataProvider } from "@/src/contexts/DataContext";
import { ThemeProvider, useThemeContext } from "@/src/contexts/ThemeContext";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";

export const AppProviders = ({ children }: { children: ReactNode }) => {

  return (
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <ActionSheetProvider>
              <RootSiblingParent>
                <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
              </RootSiblingParent>
            </ActionSheetProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
  );
};

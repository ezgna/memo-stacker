import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import mobileAds from "react-native-google-mobile-ads";

interface AdsContextProps {
  nonPersonalized: boolean;
}

const AdsContext = createContext<AdsContextProps | undefined>(undefined);

export const AdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nonPersonalized, setNonPersonalized] = useState(true);
  const [adsInitialized, setAdsInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "ios") {
        const { status } = await requestTrackingPermissionsAsync();
        // console.log("現在のトラッキング許可状態:", status);
        if (status === "granted") {
          setNonPersonalized(false);
        }
      }
      if (!adsInitialized) {
        await mobileAds().initialize();
        setAdsInitialized(true);
      }
    })();
  }, []);

  return <AdsContext.Provider value={{ nonPersonalized }}>{children}</AdsContext.Provider>;
};

export const useAdsContext = () => {
  const context = useContext(AdsContext);
  if (!context) throw new Error("useAdsContext must be used within AdsProvider");
  return context;
};

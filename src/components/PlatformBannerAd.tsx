import Constants from "expo-constants";
import React from "react";
import { Platform, View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useAdsContext } from "../contexts/AdsContext";

const PlatformBannerAd = () => {
  const { nonPersonalized } = useAdsContext();

  return (
    <>
      {Platform.OS == "ios" ? (
        <View>
          {Constants.expoConfig?.extra?.APP_ENV === "development" ? (
            <BannerAd unitId={TestIds.ADAPTIVE_BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
          ) : (
            <BannerAd
              unitId="ca-app-pub-4363360791941587/8952562876"
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: nonPersonalized }}
            />
          )}
        </View>
      ) : (
        <View>
          {Constants.expoConfig?.extra?.APP_ENV === "development" ? (
            <BannerAd unitId={TestIds.ADAPTIVE_BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
          ) : (
            <BannerAd
              unitId="ca-app-pub-4363360791941587/4098720584"
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: nonPersonalized }}
            />
          )}
        </View>
      )}
    </>
  );
};

export default PlatformBannerAd;
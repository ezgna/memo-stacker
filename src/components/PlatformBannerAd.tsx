import React from "react";
import { Platform, View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useAdsContext } from "../contexts/AdsContext";

const PlatformBannerAd = () => {
  const { nonPersonalized } = useAdsContext();

  const BANNER_AD_UNIT_ID = __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : Platform.select({
        ios: "ca-app-pub-4363360791941587/3973878294",
        android: "ca-app-pub-4363360791941587/4098720584",
      })!;

  return (
    <BannerAd
      unitId={BANNER_AD_UNIT_ID}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={!__DEV__ ? { requestNonPersonalizedAdsOnly: nonPersonalized } : undefined}
    />
  );
};

export default PlatformBannerAd;

import React, { useMemo } from "react";
import { Platform, View } from "react-native";
import { BannerAd, BannerAdSize, RequestOptions, TestIds } from "react-native-google-mobile-ads";
import { useAdsContext } from "../contexts/AdsContext";
import { useAds } from "@/src/stores/ads";

const PlatformBannerAd = () => {
  const { nonPersonalized } = useAdsContext();
  const showBanner = useAds((s) => s.showBanner);

  const BANNER_AD_UNIT_ID = __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : Platform.select({
        ios: "ca-app-pub-4363360791941587/3973878294",
        android: "ca-app-pub-4363360791941587/4098720584",
      })!;

  // const BANNER_AD_UNIT_ID = Platform.select({
  //   ios: "ca-app-pub-4363360791941587/3973878294",
  //   android: "ca-app-pub-4363360791941587/4098720584",
  // })!;

  const requestOptions = useMemo<RequestOptions>(() => ({ requestNonPersonalizedAdsOnly: nonPersonalized }), [nonPersonalized]);

  return (
    <View style={{ height: showBanner ? 67 : 0, overflow: "hidden" }}>
      <BannerAd unitId={BANNER_AD_UNIT_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={requestOptions} />
    </View>
  );
};

export default PlatformBannerAd;

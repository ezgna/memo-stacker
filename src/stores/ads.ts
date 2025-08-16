import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AdsState = {
  showBanner: boolean;
  adsRemoved: boolean;
};

type AdsActions = {
  show: () => void;
  hide: () => void;
  // set: (v: boolean) => void;
  // removeAds: () => void;
  // restoreAds: () => void;
  setAdsRemoved: (v: boolean) => void;
};

export const useAds = create<AdsState & AdsActions>()(
  persist(
    immer((set) => ({
      showBanner: true,
      adsRemoved: false,

      show: () =>
        set((s) => {
          s.showBanner = true;
        }),
      hide: () =>
        set((s) => {
          s.showBanner = false;
        }),
      // set: (v) =>
      //   set((s) => {
      //     s.showBanner = v;
      //   }),

      // removeAds: () =>
      //   set((s) => {
      //     s.adsRemoved = true;
      //   }),
      // restoreAds: () =>
      //   set((s) => {
      //     s.adsRemoved = false;
      //   }),
      setAdsRemoved: (v) =>
        set((s) => {
          s.adsRemoved = v;
        }),
    })),
    {
      name: "ads",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ adsRemoved: s.adsRemoved }),
    }
  )
);

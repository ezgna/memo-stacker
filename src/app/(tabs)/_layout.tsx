import PlatformBannerAd from "@/src/components/PlatformBannerAd";
import { useThemeContext } from "@/src/contexts/ThemeContext";
import { useAds } from "@/src/stores/ads";
import { themeColors } from "@/src/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBar, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { memo, useCallback } from "react";
import { Pressable } from "react-native";

const TabBarWithBanner = memo(function TabBarWithBanner(props: BottomTabBarProps) {
  const adsRemoved = useAds((s) => s.adsRemoved);

  return (
    <>
      {!adsRemoved && <PlatformBannerAd />}
      <BottomTabBar {...props} />
    </>
  );
});

export default function TabLayout() {
  const { theme } = useThemeContext();
  const renderTabBar = useCallback((p: BottomTabBarProps) => <TabBarWithBanner {...p} />, []);

  // const adsRemoved = useAds((s) => s.adsRemoved);

  // function TabBarWithBanner(props: BottomTabBarProps) {

  //   return (
  //     <>
  //       {!adsRemoved && <PlatformBannerAd />}
  //       <BottomTabBar {...props} />
  //     </>
  //   );
  // }

  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIconStyle: { marginTop: 6 },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: theme === "dark" ? themeColors.dark.secondaryBackground : "white",
          borderTopWidth: 0,
        },
        tabBarButton: (props) => {
          const { ref, ...rest } = props;
          return (
            <Pressable {...rest} android_ripple={{ color: "transparent" }}>
              {props.children}
            </Pressable>
          );
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="pencil-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

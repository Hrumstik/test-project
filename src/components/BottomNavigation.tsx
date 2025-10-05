import { useTheme } from "@/contexts/ThemeContext";
import i18n from "@/utils/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface BottomNavigationProps {
  activeTab: "favorites" | "recipes" | "random" | "settings";
}

export function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const tabs = [
    {
      id: "favorites" as const,
      icon: "heart-outline" as const,
      activeIcon: "heart" as const,
      label: i18n.t("favorites"),
      route: "/favorites",
    },
    {
      id: "recipes" as const,
      icon: "restaurant-outline" as const,
      activeIcon: "restaurant" as const,
      label: i18n.t("recipes"),
      route: "/recipes",
    },
    {
      id: "random" as const,
      icon: "shuffle-outline" as const,
      activeIcon: "shuffle" as const,
      label: i18n.t("random"),
      route: "/random",
    },
    {
      id: "settings" as const,
      icon: "settings-outline" as const,
      activeIcon: "settings" as const,
      label: i18n.t("settings"),
      route: "/settings",
    },
  ];

  const handleTabPress = (tab: (typeof tabs)[0]) => {
    if (activeTab !== tab.id) {
      router.push(tab.route);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.tabBarBackground,
        borderTopWidth: 1,
        borderTopColor: colors.tabBarBorder,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
      }}
    >
      <View className="flex-row justify-around items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => handleTabPress(tab)}
              className="flex-1 items-center py-2"
              style={{
                transform: [{ scale: isActive ? 1.05 : 1 }],
              }}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={24}
                color={isActive ? colors.tabBarActive : colors.tabBarInactive}
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: isActive ? colors.tabBarActive : colors.tabBarInactive,
                  marginTop: 4,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

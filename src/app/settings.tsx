import { BottomNavigation } from "@/components/BottomNavigation";
import { CategorySelector } from "@/components/CategorySelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TimeSelector } from "@/components/TimeSelector";
import { useTheme } from "@/contexts/ThemeContext";
import { useRecipes } from "@/hooks/useRecipes";

import i18n from "@/utils/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { preferences, updatePreferences } = useRecipes();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingTop: 50,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              fontSize: 20,
              color: colors.text,
            }}
          >
            {i18n.t("settings")}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center mb-3">
            <Ionicons
              name="heart-outline"
              size={24}
              color={colors.textSecondary}
            />
            <View className="ml-3 flex-1">
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: 18,
                  color: colors.text,
                }}
              >
                {i18n.t("recipe_preferences")}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: colors.text,
                }}
              >
                {i18n.t("customize_cooking")}
              </Text>
            </View>
          </View>

          <View
            className="flex-row items-center justify-between py-3"
            style={{ borderTopWidth: 1, borderTopColor: colors.border }}
          >
            <View className="flex-1">
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                {i18n.t("max_cooking_time")}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: colors.text,
                }}
              >
                {preferences.maxCookingTime} {i18n.t("minutes")}
              </Text>
            </View>
            <TimeSelector
              selectedTime={preferences.maxCookingTime}
              onTimeChange={(time) =>
                updatePreferences({ maxCookingTime: time })
              }
            />
          </View>

          <View
            className="flex-row items-center justify-between py-3"
            style={{ borderTopWidth: 1, borderTopColor: colors.border }}
          >
            <View className="flex-1">
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                {i18n.t("favorite_categories")}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: colors.text,
                }}
              >
                {preferences.favoriteCategories.length > 0
                  ? preferences.favoriteCategories.join(", ")
                  : i18n.t("all_categories")}
              </Text>
            </View>
            <CategorySelector
              selectedCategories={preferences.favoriteCategories}
              onCategoriesChange={(categories) =>
                updatePreferences({ favoriteCategories: categories })
              }
            />
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Ionicons
                name="color-palette-outline"
                size={24}
                color={colors.textSecondary}
              />
              <View className="ml-3 flex-1">
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: 16,
                    color: colors.text,
                  }}
                >
                  {i18n.t("theme")}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: colors.text,
                  }}
                >
                  Choose your preferred theme
                </Text>
              </View>
            </View>
            <ThemeToggle size="small" />
          </View>
        </View>
      </ScrollView>

      <BottomNavigation activeTab="settings" />
    </View>
  );
}

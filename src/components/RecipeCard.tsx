import { useTheme } from "@/contexts/ThemeContext";
import { Recipe } from "@/types/recipe";
import i18n from "@/utils/i18n";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "../utils/cn";
import { ImageWithFallback } from "./ImageWithFallback";

type RecipeWithFavorite = Recipe & { isFavorite: boolean };

interface RecipeCardProps {
  readonly recipe: RecipeWithFavorite;
  readonly onPress?: (recipe: RecipeWithFavorite) => void;
  readonly onFavoritePress?: (recipe: RecipeWithFavorite) => void;
  readonly className?: string;
}

export function RecipeCard({
  recipe,
  onPress,
  onFavoritePress,
  className,
}: RecipeCardProps) {
  const { colors } = useTheme();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breakfast":
        return "#FFB800";
      case "lunch":
        return "#10B981";
      case "dinner":
        return "#8B5CF6";
      case "dessert":
        return "#F59E0B";
      case "snack":
        return "#EF4444";
      default:
        return colors.textTertiary;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "breakfast":
        return i18n.t("breakfast");
      case "lunch":
        return i18n.t("lunch");
      case "dinner":
        return i18n.t("dinner");
      case "dessert":
        return i18n.t("dessert");
      case "snack":
        return i18n.t("snack");
      default:
        return category;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return colors.success;
      case "medium":
        return colors.warning;
      case "hard":
        return colors.error;
      default:
        return colors.textTertiary;
    }
  };

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return i18n.t("easy");
      case "medium":
        return i18n.t("medium");
      case "hard":
        return i18n.t("hard");
      default:
        return difficulty;
    }
  };

  return (
    <Pressable
      onPress={() => onPress?.(recipe)}
      className={cn("rounded-2xl shadow-sm overflow-hidden", className)}
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <View className="relative">
        <ImageWithFallback
          uri={recipe.image}
          className="w-full h-40"
          resizeMode="cover"
          fallbackIcon="restaurant-outline"
          fallbackText="Recipe Image"
        />

        {}
        <Pressable
          onPress={() => onFavoritePress?.(recipe)}
          className="absolute top-3 right-3 w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: colors.surface,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Ionicons
            name={recipe.isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={recipe.isFavorite ? "#FF6B6B" : colors.text}
          />
        </Pressable>

        {}
        <View
          className="absolute top-3 left-3 px-2 py-1 rounded-full"
          style={{ backgroundColor: getCategoryColor(recipe.category) }}
        >
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: "#FFFFFF",
              textTransform: "capitalize",
            }}
          >
            {getCategoryName(recipe.category)}
          </Text>
        </View>

        {}
        <View
          className="absolute bottom-3 left-3 flex-row items-center px-2 py-1 rounded-full"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="time" size={12} color={colors.text} />
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: colors.text,
              marginLeft: 4,
            }}
          >
            {recipe.time} {i18n.t("min")}
          </Text>
        </View>
      </View>

      <View className="p-5">
        <Text
          style={{
            fontFamily: "Poppins_700Bold",
            fontSize: 17,
            color: colors.text,
            marginBottom: 8,
            lineHeight: 24,
          }}
          numberOfLines={2}
        >
          {recipe.title}
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: colors.text,
            marginBottom: 12,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {recipe.description}
        </Text>

        <View className="flex-row items-center justify-end">
          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
            />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                color: colors.text,
                textTransform: "capitalize",
              }}
            >
              {getDifficultyName(recipe.difficulty)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

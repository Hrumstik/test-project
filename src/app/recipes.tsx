import { BottomNavigation } from "@/components/BottomNavigation";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RecipeCard } from "@/components/RecipeCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useRecipes } from "@/hooks/useRecipes";
import i18n from "@/utils/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function RecipesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    filteredRecipes,
    loading,
    error,
    toggleFavorite,
    getRecipeById,
    refetch,
  } = useRecipes();

  const recipesWithFavorites = filteredRecipes.map((recipe) => {
    const recipeWithFavorite = getRecipeById(recipe._id);
    return recipeWithFavorite || { ...recipe, isFavorite: false };
  });

  const handleRecipePress = (recipe: any) => {
    router.push({
      pathname: "/recipe-detail",
      params: { recipeId: recipe._id },
    });
  };

  const handleToggleFavorite = (recipe: any) => {
    toggleFavorite(recipe._id);
  };

  const handleRefresh = async () => {
    await refetch();
  };

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
            {i18n.t("recipes")}
          </Text>
          <Pressable onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View className="px-4 py-6">
        <Text
          style={{
            fontFamily: "Poppins_700Bold",
            fontSize: 28,
            color: colors.text,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {i18n.t("discover_recipes")}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          {i18n.t("find_next_dish")}
        </Text>
      </View>

      {loading ? (
        <LoadingSpinner text={i18n.t("loading_recipes")} />
      ) : error ? (
        <EmptyState
          icon="alert-circle"
          title={i18n.t("something_wrong")}
          description={error}
          actionText={i18n.t("try_again")}
          onAction={handleRefresh}
        />
      ) : filteredRecipes.length === 0 ? (
        <EmptyState
          icon="restaurant"
          title={i18n.t("no_recipes")}
          description={i18n.t("recipes_will_appear")}
          actionText={i18n.t("refresh")}
          onAction={handleRefresh}
        />
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap justify-between pb-4">
            {recipesWithFavorites.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                className="w-[48%] mb-4"
                onPress={handleRecipePress}
                onFavoritePress={handleToggleFavorite}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <BottomNavigation activeTab="recipes" />
    </View>
  );
}

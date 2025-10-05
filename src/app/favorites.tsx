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

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { favorites, loading, error, toggleFavorite, refetch } = useRecipes();

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
            {i18n.t("favorites")}
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
          {i18n.t("favorites")}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          {i18n.t("your_top_recipes")}
        </Text>
      </View>

      {loading ? (
        <LoadingSpinner text={i18n.t("loading")} />
      ) : error ? (
        <EmptyState
          icon="alert-circle"
          title={i18n.t("something_wrong")}
          description={error}
          actionText={i18n.t("try_again")}
          onAction={handleRefresh}
        />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title={i18n.t("no_recipes")}
          description={i18n.t("recipes_will_appear")}
          actionText={i18n.t("refresh")}
          onAction={() => router.push("/recipes")}
        />
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap justify-between pb-4">
            {favorites.map((recipe) => (
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

      <BottomNavigation activeTab="favorites" />
    </View>
  );
}

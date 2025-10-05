import { BottomNavigation } from "@/components/BottomNavigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RecipeCard } from "@/components/RecipeCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useRecipes } from "@/hooks/useRecipes";
import i18n from "@/utils/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function RandomScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    filteredRecipes,
    loading,
    toggleFavorite,
    getRecipeById,
    getRandomRecipeByTime,
  } = useRecipes();
  const [randomRecipe, setRandomRecipe] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return i18n.t("good_morning");
    } else if (hour >= 12 && hour < 18) {
      return i18n.t("good_afternoon");
    } else {
      return i18n.t("good_evening");
    }
  };

  useEffect(() => {
    const loadRandomRecipe = async () => {
      if (!randomRecipe) {
        const newRandomRecipe = await getRandomRecipeByTime();
        if (newRandomRecipe) {
          setRandomRecipe(newRandomRecipe);
        }
      }
    };
    loadRandomRecipe();
  }, [randomRecipe, getRandomRecipeByTime]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const newRandomRecipe = await getRandomRecipeByTime();
    if (newRandomRecipe) {
      setRandomRecipe(newRandomRecipe);
    }
    setIsRefreshing(false);
  };

  const handleRecipePress = (recipe: any) => {
    router.push({
      pathname: "/recipe-detail",
      params: { recipeId: recipe._id },
    });
  };

  const handleToggleFavorite = (recipe: any) => {
    toggleFavorite(recipe._id);
    setRandomRecipe({ ...recipe, isFavorite: !recipe.isFavorite });
  };

  const timeCategory = randomRecipe?.category || "snack";
  const categoryNames = {
    breakfast: i18n.t("breakfast"),
    lunch: i18n.t("lunch"),
    dinner: i18n.t("dinner"),
    snack: i18n.t("snack"),
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {}
      <View
        className="flex-row justify-between items-center px-4 py-2"
        style={{ backgroundColor: colors.background, paddingTop: 50 }}
      >
        <View className="flex-1">
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              fontSize: 20,
              color: colors.text,
            }}
          >
            {getGreeting()}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            {i18n.t("your_suggestion")}{" "}
            {categoryNames[timeCategory as keyof typeof categoryNames]}
          </Text>
        </View>

        <Pressable
          onPress={handleRefresh}
          disabled={isRefreshing}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: colors.primary,
            opacity: isRefreshing ? 0.6 : 1,
          }}
        >
          <Ionicons name="refresh" size={20} color={colors.buttonText} />
        </Pressable>
      </View>

      {}
      {loading ? (
        <LoadingSpinner text={i18n.t("loading_recipe")} />
      ) : randomRecipe ? (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: 18,
                  color: colors.text,
                }}
              >
                Featured Recipe
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    color: colors.primary,
                  }}
                >
                  {categoryNames[timeCategory as keyof typeof categoryNames]}
                </Text>
              </View>
            </View>

            <RecipeCard
              recipe={randomRecipe}
              className="w-full"
              onPress={handleRecipePress}
              onFavoritePress={handleToggleFavorite}
            />
          </View>

          {}
          <View className="mb-6">
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: 18,
                color: colors.text,
                marginBottom: 16,
              }}
            >
              {i18n.t("more_ideas")}{" "}
              {categoryNames[timeCategory as keyof typeof categoryNames]}
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {filteredRecipes
                .filter(
                  (recipe) =>
                    recipe.category === timeCategory &&
                    recipe._id !== randomRecipe._id
                )
                .slice(0, 4)
                .map((recipe) => {
                  const recipeWithFavorite = getRecipeById(recipe._id);
                  return (
                    <RecipeCard
                      key={recipe._id}
                      recipe={
                        recipeWithFavorite || { ...recipe, isFavorite: false }
                      }
                      className="w-[48%] mb-4"
                      onPress={handleRecipePress}
                      onFavoritePress={handleToggleFavorite}
                    />
                  );
                })}
            </View>
          </View>

          {}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb-outline" size={24} color={colors.primary} />
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: 16,
                  color: colors.text,
                  marginLeft: 8,
                }}
              >
                Cooking Tip
              </Text>
            </View>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.textSecondary,
                lineHeight: 20,
              }}
            >
              {timeCategory === "breakfast" &&
                "Start your day with a protein-rich breakfast to keep you energized until lunch."}
              {timeCategory === "lunch" &&
                "Include vegetables and lean protein in your lunch for sustained energy throughout the afternoon."}
              {timeCategory === "dinner" &&
                "Keep dinner light and balanced to promote better sleep and digestion."}
              {timeCategory === "snack" &&
                "Choose nutrient-dense snacks like nuts or fruits to curb hunger between meals."}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="restaurant" size={64} color={colors.textSecondary} />
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              fontSize: 20,
              color: colors.text,
              textAlign: "center",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            No Recipes Available
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            Check back later for new recipes
          </Text>
        </View>
      )}

      {}
      <BottomNavigation activeTab="random" />
    </View>
  );
}

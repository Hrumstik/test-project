import { AppLoadingIndicator } from "@/components/AppLoadingIndicator";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useTheme } from "@/contexts/ThemeContext";
import { useRecipes } from "@/hooks/useRecipes";
import { Recipe } from "@/types/recipe";
import i18n from "@/utils/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type RecipeWithFavorite = Recipe & { isFavorite: boolean };

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { recipeId } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const {
    recipes,
    loading: recipesLoading,
    toggleFavorite,
    getRecipeById,
  } = useRecipes();
  const [recipe, setRecipe] = useState<RecipeWithFavorite | null>(null);

  useEffect(() => {
    if (recipeId && recipes.length > 0) {
      const foundRecipe = getRecipeById(recipeId as string);
      setRecipe(foundRecipe);
    }
  }, [recipeId, recipes, getRecipeById]);

  const handleToggleFavorite = () => {
    if (recipe) {
      toggleFavorite(recipe._id);
    }
  };

  if (recipesLoading) {
    return (
      <>
        <StatusBar style={isDark ? "light" : "dark"} />
        <AppLoadingIndicator text={i18n.t("loading_recipe")} />
      </>
    );
  }

  if (!recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View
          className="flex-1 items-center justify-center px-8"
          style={{ paddingTop: 50 }}
        >
          <Ionicons name="alert-circle" size={64} color={colors.error} />
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
            Recipe not found
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: colors.text,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            This recipe might have been removed or doesn&apos;t exist
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                color: colors.buttonText,
              }}
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingTop: 50,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text
          style={{
            fontFamily: "Poppins_700Bold",
            fontSize: 18,
            color: colors.text,
          }}
        >
          Recipe
        </Text>
        <Pressable onPress={handleToggleFavorite}>
          <Ionicons
            name={recipe.isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={recipe.isFavorite ? "#FF6B6B" : colors.text}
          />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {}
        <View className="relative">
          <ImageWithFallback
            uri={recipe.image}
            className="w-full h-80"
            resizeMode="cover"
            fallbackIcon="restaurant-outline"
            fallbackText="Recipe Image"
          />
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: 28,
                color: "#FFFFFF",
                marginBottom: 8,
                lineHeight: 34,
              }}
            >
              {recipe.title}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: "#FFFFFF",
                lineHeight: 24,
                opacity: 0.9,
              }}
            >
              {recipe.description}
            </Text>
          </View>
        </View>

        {}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            paddingVertical: 24,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={20} color={colors.text} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                color: colors.text,
                marginLeft: 8,
              }}
            >
              {recipe.time} min
            </Text>
          </View>
        </View>

        {}
        <View className="px-4 py-6">
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              fontSize: 22,
              color: colors.text,
              marginBottom: 20,
            }}
          >
            {i18n.t("ingredients")}
          </Text>

          {recipe.ingredients.map((ingredient, index) => (
            <View
              key={index}
              className="flex-row items-center py-3"
              style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <View className="w-7 h-7 bg-orange-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="checkmark" size={16} color="#D67200" />
              </View>
              <View className="flex-1">
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: colors.text,
                    lineHeight: 22,
                  }}
                >
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {}
        <View
          className="px-4 py-6"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              fontSize: 22,
              color: colors.text,
              marginBottom: 20,
            }}
          >
            {i18n.t("instructions")}
          </Text>

          {recipe.instructions.map((instruction, index) => (
            <View
              key={index}
              className="flex-row items-start py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center mr-4 mt-1">
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: colors.text,
                  lineHeight: 26,
                  flex: 1,
                }}
              >
                {instruction}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

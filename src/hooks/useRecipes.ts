import { Recipe } from "@/types/recipe";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export interface UserPreferences {
  favoriteCategories: string[];
  preferredDifficulty: string[];
  maxCookingTime: number;
  dietaryRestrictions: string[];
}

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteCategories: [],
    preferredDifficulty: [],
    maxCookingTime: 60,
    dietaryRestrictions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("https://pwac.world/recipes");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const loadedRecipes = (await response.json()) as Recipe[];
        setRecipes(loadedRecipes);

        const savedFavorites = await AsyncStorage.getItem("favorites");
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }

        const savedPreferences = await AsyncStorage.getItem("preferences");
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }
      } catch (error) {
        console.error("Failed to load recipes:", error);
        setError("Failed to load recipes");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      try {
        const newFavorites = favorites.includes(recipeId)
          ? favorites.filter((id) => id !== recipeId)
          : [...favorites, recipeId];

        setFavorites(newFavorites);
        await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
    },
    [favorites]
  );

  const updatePreferences = useCallback(
    async (newPreferences: Partial<UserPreferences>) => {
      try {
        const updatedPreferences = { ...preferences, ...newPreferences };
        setPreferences(updatedPreferences);
        await AsyncStorage.setItem(
          "preferences",
          JSON.stringify(updatedPreferences)
        );
      } catch (error) {
        console.error("Failed to save preferences:", error);
      }
    },
    [preferences]
  );

  const getRecipeById = useCallback(
    (id: string) => {
      const recipe = recipes.find((recipe) => recipe._id === id);
      return recipe ? { ...recipe, isFavorite: favorites.includes(id) } : null;
    },
    [recipes, favorites]
  );

  const getFavoriteRecipes = useCallback(() => {
    return recipes
      .filter((recipe) => favorites.includes(recipe._id))
      .map((recipe) => ({ ...recipe, isFavorite: true }));
  }, [recipes, favorites]);

  const getFilteredRecipes = useCallback(() => {
    return recipes.filter((recipe) => {
      if (
        preferences.favoriteCategories.length > 0 &&
        !preferences.favoriteCategories.includes(recipe.category)
      ) {
        return false;
      }

      if (
        preferences.preferredDifficulty.length > 0 &&
        !preferences.preferredDifficulty.includes(recipe.difficulty)
      ) {
        return false;
      }

      if (recipe.time > preferences.maxCookingTime) {
        return false;
      }

      return true;
    });
  }, [recipes, preferences]);

  const getRandomRecipeByTime = useCallback(async () => {
    try {
      const response = await fetch("https://pwac.world/recipes/random-by-time");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const randomRecipe = (await response.json()) as Recipe;
      return {
        ...randomRecipe,
        isFavorite: favorites.includes(randomRecipe._id),
      };
    } catch (error) {
      console.error("Failed to get random recipe by time:", error);
      return null;
    }
  }, [favorites]);

  return {
    recipes,
    favorites: getFavoriteRecipes(),
    filteredRecipes: getFilteredRecipes(),
    preferences,
    loading,
    error,
    toggleFavorite,
    getRecipeById,
    getRandomRecipeByTime,
    updatePreferences,
    refetch: async () => {
      setLoading(true);
      try {
        setError(null);

        const response = await fetch("https://pwac.world/recipes");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const loadedRecipes = (await response.json()) as Recipe[];
        setRecipes(loadedRecipes);

        const savedFavorites = await AsyncStorage.getItem("favorites");
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }

        const savedPreferences = await AsyncStorage.getItem("preferences");
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }
      } catch (error) {
        console.error("Failed to refetch recipes:", error);
        setError("Failed to reload recipes");
      } finally {
        setLoading(false);
      }
    },
  };
};

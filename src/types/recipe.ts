export interface Recipe {
  _id: string;
  title: string;
  description: string;
  time: number;
  difficulty: "easy" | "medium" | "hard";
  category: "breakfast" | "lunch" | "dinner" | "dessert" | "snack";
  image: string;
  ingredients: Ingredient[];
  instructions: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Ingredient {
  _id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    dietaryRestrictions: string[];
    favoriteCategories: string[];
    notifications: {
      newRecipes: boolean;
      reminders: boolean;
      weekly: boolean;
    };
  };
}

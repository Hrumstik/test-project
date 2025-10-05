import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof lightColors;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const lightColors = {
  background: "#FFF9EB",
  surface: "#FFFFFF",
  surfaceSecondary: "#F8F9FA",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textTertiary: "#999999",
  primary: "#D67200",
  primaryLight: "#FF8A00",
  primaryDark: "#B85C00",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  shadow: "#000000",
  cardBackground: "#FFFFFF",
  cardBorder: "#E5E7EB",
  buttonPrimary: "#D67200",
  buttonSecondary: "#F3F4F6",
  buttonText: "#FFFFFF",
  buttonTextSecondary: "#1A1A1A",
  inputBackground: "#FFFFFF",
  inputBorder: "#D1D5DB",
  inputText: "#1A1A1A",
  inputPlaceholder: "#9CA3AF",
  tabBarBackground: "#FFFFFF",
  tabBarBorder: "#E5E7EB",
  tabBarActive: "#D67200",
  tabBarInactive: "#9CA3AF",
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.1)",
};

const darkColors = {
  background: "#0F0F0F",
  surface: "#1A1A1A",
  surfaceSecondary: "#2A2A2A",
  text: "#FFFFFF",
  textSecondary: "#E5E7EB",
  textTertiary: "#9CA3AF",
  primary: "#FF8A00",
  primaryLight: "#FFA500",
  primaryDark: "#D67200",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",
  border: "#374151",
  borderLight: "#4B5563",
  shadow: "#000000",
  cardBackground: "#1A1A1A",
  cardBorder: "#374151",
  buttonPrimary: "#FF8A00",
  buttonSecondary: "#374151",
  buttonText: "#FFFFFF",
  buttonTextSecondary: "#FFFFFF",
  inputBackground: "#1A1A1A",
  inputBorder: "#4B5563",
  inputText: "#FFFFFF",
  inputPlaceholder: "#9CA3AF",
  tabBarBackground: "#1A1A1A",
  tabBarBorder: "#374151",
  tabBarActive: "#FF8A00",
  tabBarInactive: "#6B7280",
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");
  const [isDark, setIsDark] = useState(false);

  const updateIsDark = useCallback(() => {
    if (theme === "system") {
      setIsDark(systemColorScheme === "dark");
    } else {
      setIsDark(theme === "dark");
    }
  }, [theme, systemColorScheme]);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    updateIsDark();
  }, [theme, systemColorScheme, updateIsDark]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem("theme", newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

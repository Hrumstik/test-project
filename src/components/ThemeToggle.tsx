import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text } from "react-native";

interface ThemeToggleProps {
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export function ThemeToggle({
  size = "medium",
  showLabel = true,
}: ThemeToggleProps) {
  const { theme, isDark, toggleTheme, colors } = useTheme();

  const getIcon = () => {
    if (theme === "system") return "phone-portrait-outline";
    return isDark ? "moon" : "sunny";
  };

  const getLabel = () => {
    if (theme === "system") return "System";
    return isDark ? "Dark" : "Light";
  };

  const getSize = () => {
    switch (size) {
      case "small":
        return 20;
      case "large":
        return 28;
      default:
        return 24;
    }
  };

  return (
    <Pressable
      onPress={toggleTheme}
      className="flex-row items-center"
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Ionicons name={getIcon()} size={getSize()} color={colors.primary} />
      {showLabel && (
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 14,
            color: colors.text,
            marginLeft: 8,
          }}
        >
          {getLabel()}
        </Text>
      )}
    </Pressable>
  );
}

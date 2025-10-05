import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "large",
  color,
  text,
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const spinnerColor = color || colors.primary;

  return (
    <View className="flex-1 items-center justify-center py-8">
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && (
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: colors.textSecondary,
            marginTop: 12,
          }}
        >
          {text}
        </Text>
      )}
    </View>
  );
}

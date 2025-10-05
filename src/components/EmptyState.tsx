import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: colors.surfaceSecondary }}
      >
        <Ionicons name={icon} size={32} color={colors.textTertiary} />
      </View>

      <Text
        style={{
          fontFamily: "Poppins_700Bold",
          fontSize: 20,
          color: colors.text,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 24,
          marginBottom: actionText ? 24 : 0,
        }}
      >
        {description}
      </Text>

      {actionText && onAction && (
        <Pressable
          onPress={onAction}
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
            {actionText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

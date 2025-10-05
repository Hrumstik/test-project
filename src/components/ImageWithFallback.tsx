import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";

interface ImageWithFallbackProps {
  uri: string;
  style?: any;
  className?: string;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  fallbackText?: string;
}

export function ImageWithFallback({
  uri,
  style,
  className,
  resizeMode = "cover",
  fallbackIcon = "image-outline",
  fallbackText,
}: ImageWithFallbackProps) {
  const { colors } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (error: any) => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setHasError(false);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: colors.surfaceSecondary,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
        className={className}
      >
        <Ionicons name={fallbackIcon} size={48} color={colors.textTertiary} />
        {fallbackText && (
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: colors.textTertiary,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {fallbackText}
          </Text>
        )}
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      className={className}
      resizeMode={resizeMode}
      onError={handleError}
      onLoad={handleLoad}
      defaultSource={require("@/assets/images/welcome.png")}
    />
  );
}

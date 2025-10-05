import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface AppLoadingIndicatorProps {
  text?: string;
  size?: "small" | "large";
}

export function AppLoadingIndicator({
  text = "Loading...",
  size = "large",
}: AppLoadingIndicatorProps) {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get("window");

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const isLarge = size === "large";
  const containerSize = isLarge ? width * 0.7 : width * 0.5;
  const textSize = isLarge ? 18 : 14;
  const dotSize = isLarge ? 8 : 6;

  return (
    <View style={[styles.container, { width: containerSize }]}>
      {/* Loading Text */}
      <Text
        style={[
          styles.loadingText,
          {
            fontSize: textSize,
            color: colors.text,
            marginBottom: isLarge ? 20 : 15,
          },
        ]}
      >
        {text}
      </Text>

      {/* Animated Dots */}
      <View style={styles.dotsContainer}>
        {[...Array(3)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                backgroundColor: colors.primary,
                transform: [
                  {
                    scale: animatedValue.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.2, 0.8],
                    }),
                  },
                ],
                opacity: animatedValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.4, 1, 0.4],
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    borderRadius: 50,
  },
});

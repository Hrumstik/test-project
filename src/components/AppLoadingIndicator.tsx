import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
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

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const isLarge = size === "large";
  const textSize = isLarge ? 18 : 14;
  const barWidth = isLarge ? 4 : 3;
  const barHeight = isLarge ? 20 : 16;

  return (
    <View style={styles.container}>
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

      {/* Animated Progress Bars */}
      <View style={styles.barsContainer}>
        {[...Array(5)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                width: barWidth,
                height: barHeight,
                backgroundColor: colors.primary,
                transform: [
                  {
                    scaleY: animatedValue.interpolate({
                      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                      outputRange: [0.3, 1, 0.3, 1, 0.3, 0.3],
                    }),
                  },
                ],
                opacity: animatedValue.interpolate({
                  inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                  outputRange: [0.3, 1, 0.3, 1, 0.3, 0.3],
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
  barsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bar: {
    borderRadius: 2,
  },
});

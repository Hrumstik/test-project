import React, { useEffect, useRef } from "react";
import { View, Text, Image, Dimensions, Animated } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AppLoadingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get("window");
  const isLandscape = width > height;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, [fadeAnim, scaleAnim, pulseAnim]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 30,
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: "center",
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <Image
              source={require("@/assets/icons/logo.png")}
              style={{
                width: isLandscape ? 120 : 140,
                height: isLandscape ? 120 : 140,
                borderRadius: 70,
              }}
            />
          </Animated.View>

          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              fontSize: isLandscape ? 28 : 32,
              color: colors.text,
              textAlign: "center",
              marginTop: 20,
              letterSpacing: 1,
            }}
          >
            Tasty Clucker
          </Text>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: isLandscape ? 16 : 18,
              color: colors.textSecondary,
              textAlign: "center",
              marginTop: 8,
              opacity: 0.8,
            }}
          >
            Creations
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "./Button";

interface NoInternetScreenProps {
  onRetry: () => void;
  onGoToFallback?: () => void;
  isFirstLaunch?: boolean;
}

export const NoInternetScreen: React.FC<NoInternetScreenProps> = ({
  onRetry,
  onGoToFallback,
  isFirstLaunch = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📶</Text>
        </View>

        <Text style={styles.title}>No Internet Connection</Text>

        <Text style={styles.message}>
          {isFirstLaunch
            ? "Check your internet connection and try again, or continue with the app"
            : "Check your internet connection and try again"}
        </Text>

        <View style={styles.buttonContainer}>
          <Button title="Retry" onPress={onRetry} style={styles.retryButton} />

          {onGoToFallback && isFirstLaunch && (
            <Button
              title="Continue with app"
              onPress={onGoToFallback}
              style={styles.fallbackButton}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconText: {
    fontSize: 80,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    width: "100%",
  },
  retryButton: {
    minWidth: 180,
    marginBottom: 10,
  },
  fallbackButton: {
    minWidth: 180,
    backgroundColor: "#cccccc",
  },
});

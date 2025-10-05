import React from "react";
import { View, Text, StyleSheet, Platform, Image } from "react-native";
import { Button } from "./Button";

interface PermissionRequestScreenProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const PermissionRequestScreen: React.FC<
  PermissionRequestScreenProps
> = ({ onAccept, onDecline }) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#1A0F0A",
      padding: 20,
    },
    content: {
      alignItems: "center",
      maxWidth: 350,
      backgroundColor: "transparent",
      padding: 32,
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "#FFD700",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 32,
      shadowColor: "#FFD700",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    logo: {
      width: 80,
      height: 80,
      resizeMode: "contain",
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 16,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    message: {
      fontSize: 16,
      color: "#E5E5E5",
      marginBottom: 48,
      textAlign: "center",
      lineHeight: 24,
    },
    buttonContainer: {
      width: "100%",
      marginBottom: 24,
    },
    acceptButton: {
      marginBottom: 16,
      backgroundColor: "#FFD700",
      borderRadius: 8,
      shadowColor: "#FFD700",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    acceptButtonText: {
      color: "#000000",
      fontWeight: "700",
      fontSize: 16,
      textTransform: "uppercase",
    },
    declineButton: {
      backgroundColor: "transparent",
      borderWidth: 0,
      borderRadius: 8,
    },
    declineButtonText: {
      color: "#FFFFFF",
      fontWeight: "400",
      fontSize: 16,
    },
    note: {
      fontSize: 13,
      color: "#B0B0B0",
      textAlign: "center",
      lineHeight: 18,
      opacity: 0.8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/icons/logo.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>
          ALLOW NOTIFICATIONS ABOUT BONUSES AND PROMOS
        </Text>

        <Text style={styles.message}>
          Stay tuned with best info from our app
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Yes, I Want Bonuses!"
            onPress={onAccept}
            style={styles.acceptButton}
            textStyle={styles.acceptButtonText}
          />

          <Button
            title="Skip"
            onPress={onDecline}
            style={styles.declineButton}
            textStyle={styles.declineButtonText}
          />
        </View>

        <Text style={styles.note}>
          {Platform.OS === "android" && Platform.Version >= 33
            ? "You can change this setting later in your device settings."
            : "You can change this setting later in your device settings."}
        </Text>
      </View>
    </View>
  );
};

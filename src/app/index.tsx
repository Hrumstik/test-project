import { Button } from "@/components/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { AppContainer } from "@/components/AppContainer";
import { getAppConfig } from "@/config/appConfig";
import i18n from "@/utils/i18n";
import { useRouter } from "expo-router";
import { Image, Text, View, Dimensions, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

export default function IndexScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const isLandscape = dimensions.width > dimensions.height;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const getResponsiveStyles = () => {
    const basePadding = 20;
    const maxContentWidth = 400;

    return {
      container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      },
      header: {
        flexDirection: "row" as const,
        justifyContent: "flex-end" as const,
        alignItems: "center" as const,
        paddingHorizontal: basePadding,
        paddingVertical: 10,
        backgroundColor: colors.background,
      },
      content: {
        flex: 1,
        justifyContent: "center" as const,
        alignItems: "center" as const,
        paddingHorizontal: basePadding,
        paddingVertical: isLandscape ? 20 : 40,
        maxWidth: maxContentWidth,
        alignSelf: "center" as const,
        width: "100%" as const,
      },
      logoContainer: {
        alignItems: "center" as const,
        marginBottom: isLandscape ? 20 : 30,
      },
      logo: {
        width: isLandscape ? 60 : 64,
        height: isLandscape ? 60 : 64,
        marginBottom: 10,
      },
      logoText: {
        fontFamily: "Poppins_700Bold",
        fontSize: isLandscape ? 20 : 25,
        color: colors.text,
      },
      welcomeImage: {
        width: isLandscape ? 150 : Math.min(250, dimensions.width * 0.6),
        height: isLandscape ? 150 : Math.min(250, dimensions.width * 0.6),
        borderRadius: isLandscape ? 75 : Math.min(125, dimensions.width * 0.3),
        marginBottom: isLandscape ? 20 : 30,
      },
      textContainer: {
        alignItems: "center" as const,
        marginBottom: isLandscape ? 20 : 30,
      },
      welcomeText: {
        fontFamily: "Inter_400Regular",
        fontSize: isLandscape ? 16 : 18,
        lineHeight: isLandscape ? 24 : 28,
        color: colors.textSecondary,
        textAlign: "center" as const,
      },
      titleText: {
        fontFamily: "Poppins_800ExtraBold",
        fontSize: isLandscape ? 20 : 25,
        color: colors.text,
        textAlign: "center" as const,
      },
      buttonContainer: {
        width: "100%" as const,
        marginTop: 20,
        marginBottom: 10,
      },
    };
  };

  const styles = getResponsiveStyles();

  const appComponent = (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemeToggle size="small" showLabel={false} />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/icons/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.logoText}>Tasty Clucker Creations</Text>
          </View>

          <Image
            source={require("@/assets/images/welcome.png")}
            style={styles.welcomeImage}
          />

          <View style={styles.textContainer}>
            <Text style={styles.welcomeText}>{i18n.t("welcome")}</Text>
            <Text style={styles.titleText}>Tasty Clucker Creations</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              style={{
                width: "100%",
                transform: [{ scale: 1.05 }],
                backgroundColor: colors.buttonPrimary,
              }}
              title={i18n.t("start_cooking")}
              onPress={() => router.push("/recipes")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const config = getAppConfig();

  return <AppContainer config={config} fallbackComponent={appComponent} />;
}

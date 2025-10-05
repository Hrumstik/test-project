import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  Platform,
  Linking,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppLoadingIndicator } from "./AppLoadingIndicator";
import { Button } from "./Button";

interface WebViewComponent {
  reload: () => void;
  goBack: () => void;
  canGoBack: () => boolean;
}

let WebView: React.ComponentType<WebViewProps> | null = null;

interface WebViewProps {
  ref: React.RefObject<WebViewComponent | null>;
  source: { uri: string };
  style: object;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  onError: (syntheticEvent: { nativeEvent: { description: string } }) => void;
  onHttpError: (syntheticEvent: {
    nativeEvent: { statusCode: number };
  }) => void;
  onShouldStartLoadWithRequest: (request: { url: string }) => boolean;
  startInLoadingState: boolean;
  javaScriptEnabled: boolean;
  domStorageEnabled: boolean;
  allowsInlineMediaPlayback: boolean;
  mediaPlaybackRequiresUserAction: boolean;
  allowsBackForwardNavigationGestures: boolean;
  mixedContentMode: string;
  thirdPartyCookiesEnabled: boolean;
  sharedCookiesEnabled: boolean;
  userAgent: string;
}
if (Platform.OS === "ios" || Platform.OS === "android") {
  try {
    const { WebView: WebViewComponent } = require("react-native-webview");
    WebView = WebViewComponent;
  } catch (error) {
    console.warn("WebView not available:", error);
  }
}

interface AppWebViewProps {
  url: string;
  onError?: (error: string) => void;
  onRetry?: () => void;
}

export const AppWebView: React.FC<AppWebViewProps> = ({
  url,
  onError,
  onRetry,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [redirectCount, setRedirectCount] = useState(0);
  const webViewRef = useRef<WebViewComponent>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate custom User-Agent that doesn't indicate WebView usage
  const getCustomUserAgent = () => {
    const platform = Platform.OS === "ios" ? "iPhone" : "Android";
    const version = Platform.OS === "ios" ? "15.0" : "11.0";
    const webkitVersion = "605.1.15";

    return `Mozilla/5.0 (${platform}; ${Platform.OS === "ios" ? "CPU iPhone OS" : "Linux; Android"} ${version}) AppleWebKit/${webkitVersion} (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1`;
  };

  // Handle back button press
  const handleBackPress = useCallback(() => {
    if (
      canGoBack &&
      webViewRef.current &&
      typeof webViewRef.current.goBack === "function"
    ) {
      try {
        webViewRef.current.goBack();
        return true; // Prevent default back behavior
      } catch {
        console.log("🔄 AppWebView: goBack not available");
        return false; // Allow default back behavior
      }
    }
    return false; // Allow default back behavior (close WebView)
  }, [canGoBack]);

  // Setup back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  if (!WebView) {
    return (
      <SafeAreaView
        style={styles.unsupportedContainer}
        edges={["top", "bottom", "left", "right"]}
      >
        <View style={styles.unsupportedContent}>
          <Text style={styles.unsupportedTitle}>WebView not supported</Text>
          <Text style={styles.unsupportedMessage}>
            WebView is not supported on this platform. Open the link in browser:
          </Text>
          <Text style={styles.urlText}>{url}</Text>
          <Button
            title="Open in browser"
            onPress={() => {
              Linking.openURL(url);
            }}
            style={styles.browserButton}
          />
          {onRetry && (
            <Button
              title="Retry"
              onPress={() => {
                onRetry();
              }}
              style={styles.retryButton}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const handleLoadStart = () => {
    if (isInitialLoad) {
      setIsLoading(true);
      setRedirectCount(0);
    } else {
      // Increment redirect count for non-initial loads
      setRedirectCount((prev) => prev + 1);
    }
    setHasError(false);

    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Set a timeout to handle potential redirect loops
    redirectTimeoutRef.current = setTimeout(() => {
      if (redirectCount > 10) {
        console.log(
          "🔄 AppWebView: Too many redirects detected, but continuing..."
        );
      }
    }, 5000);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    setIsInitialLoad(false);

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    if (
      webViewRef.current &&
      typeof webViewRef.current.canGoBack === "function"
    ) {
      try {
        const canNavigateBack = webViewRef.current.canGoBack();
        setCanGoBack(canNavigateBack);
      } catch {
        console.log("🔄 AppWebView: canGoBack not available, setting to false");
        setCanGoBack(false);
      }
    }
  };

  const handleError = (syntheticEvent: {
    nativeEvent: { description: string };
  }) => {
    const { nativeEvent } = syntheticEvent;
    console.error("🚨 AppWebView: WebView error occurred:", nativeEvent);
    console.error("🚨 AppWebView: Error description:", nativeEvent.description);

    // Check if it's a redirect error
    const isRedirectError =
      nativeEvent.description?.includes("ERR_TOO_MANY_REDIRECTS") ||
      nativeEvent.description?.includes("too many redirects") ||
      nativeEvent.description?.includes("redirect");

    if (isRedirectError) {
      console.log(
        "🔄 AppWebView: Redirect error detected, attempting to continue loading..."
      );
      // Don't set error state for redirect issues, let it continue loading
      return;
    }

    setIsLoading(false);
    setHasError(true);
    onError?.(nativeEvent.description || "Failed to load page");
  };

  const handleHttpError = (syntheticEvent: {
    nativeEvent: { statusCode: number };
  }) => {
    const { nativeEvent } = syntheticEvent;

    if (nativeEvent.statusCode >= 300 && nativeEvent.statusCode < 400) {
      console.log(
        `🔄 AppWebView: Redirect status code ${nativeEvent.statusCode}, continuing...`
      );
      return;
    }

    setIsLoading(false);
    setHasError(true);
    onError?.(`HTTP Error: ${nativeEvent.statusCode}`);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setIsInitialLoad(true);
    setCanGoBack(false);
    setRedirectCount(0);

    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    if (webViewRef.current && typeof webViewRef.current.reload === "function") {
      try {
        webViewRef.current.reload();
      } catch {
        console.log("🔄 AppWebView: reload not available");
      }
    }
    onRetry?.();
  };

  const handleShouldStartLoadWithRequest = () => {
    return true;
  };
  if (hasError) {
    return (
      <SafeAreaView
        style={styles.errorContainer}
        edges={["top", "bottom", "left", "right"]}
      >
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Loading Error</Text>
          <Text style={styles.errorMessage}>
            Failed to load page. Check your internet connection.
          </Text>
          <Button
            title="Retry"
            onPress={handleRetry}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleHttpError}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        startInLoadingState={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsBackForwardNavigationGestures={true}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        userAgent={getCustomUserAgent()}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <AppLoadingIndicator size="large" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    zIndex: 1000,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  errorContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    minWidth: 120,
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  unsupportedContent: {
    alignItems: "center",
    maxWidth: 350,
  },
  unsupportedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
    textAlign: "center",
  },
  unsupportedMessage: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  urlText: {
    fontSize: 14,
    color: "#007bff",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  browserButton: {
    minWidth: 180,
    marginBottom: 10,
  },
});

import React, { useState, useRef } from "react";
import { View, StyleSheet, Text, Platform, Linking } from "react-native";
import { LoadingSpinner } from "./LoadingSpinner";
import { Button } from "./Button";

interface WebViewComponent {
  reload: () => void;
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
  const webViewRef = useRef<WebViewComponent>(null);

  if (!WebView) {
    return (
      <View style={styles.unsupportedContainer}>
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
      </View>
    );
  }

  const handleLoadStart = () => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    setIsInitialLoad(false);
  };

  const handleError = (syntheticEvent: {
    nativeEvent: { description: string };
  }) => {
    const { nativeEvent } = syntheticEvent;
    console.error("🚨 AppWebView: WebView error occurred:", nativeEvent);
    console.error("🚨 AppWebView: Error description:", nativeEvent.description);

    setIsLoading(false);
    setHasError(true);
    onError?.(nativeEvent.description || "Failed to load page");
  };

  const handleHttpError = (syntheticEvent: {
    nativeEvent: { statusCode: number };
  }) => {
    const { nativeEvent } = syntheticEvent;
    setIsLoading(false);
    setHasError(true);
    onError?.(`HTTP Error: ${nativeEvent.statusCode}`);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setIsInitialLoad(true);
    webViewRef.current?.reload();
    onRetry?.();
  };

  const handleShouldStartLoadWithRequest = () => {
    return true;
  };
  if (hasError) {
    return (
      <View style={styles.errorContainer}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner size="large" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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

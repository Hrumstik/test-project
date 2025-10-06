import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  Platform,
  BackHandler,
  Linking,
  NativeSyntheticEvent,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

import { Button } from "./Button";

interface AppWebViewProps {
  url: string;
  onError?: (error: string) => void;
  onRetry?: () => void;
  darkSafeArea?: boolean;
  onDeeplink?: (url: string) => void;
  onFileUpload?: (file: any) => void;
}

export const AppWebView: React.FC<AppWebViewProps> = ({
  url,
  onError,
  onRetry,
  darkSafeArea = false,
  onDeeplink,
  onFileUpload,
}) => {
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(url);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      "change",
      ({ window }) => {}
    );
    return () => subscription?.remove();
  }, []);

  const getCustomUserAgent = (): string => {
    const platform = Platform.OS === "ios" ? "iPhone" : "Android";
    const version = Platform.OS === "ios" ? "17.0" : "13.0";
    return `Mozilla/5.0 (${platform}; ${
      Platform.OS === "ios" ? "CPU iPhone OS" : "Linux; Android"
    } ${version}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile Safari/604.1`;
  };

  const handleBackPress = useCallback(() => {
    const canGoBack = webViewRef.current && "goBack" in webViewRef.current;
    if (canGoBack) {
      try {
        webViewRef.current?.goBack?.();
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => sub.remove();
  }, [handleBackPress]);

  const handleLoadStart = () => {
    setHasError(false);
  };

  const handleError = (event: NativeSyntheticEvent<any>) => {
    const { description = "", domain = "", code = 0 } = event.nativeEvent;
    const lower = description.toLowerCase();
    console.log("handleError", { description, domain, code });

    const isRedirectError =
      lower.includes("redirect") ||
      code === -1007 ||
      (domain === "NSURLErrorDomain" &&
        (lower.includes("слишком много переадресовок") ||
          lower.includes("too many redirects")));

    if (isRedirectError) {
      console.log("🔄 Too many redirects — reloading:", currentUrl);
      setHasError(false);

      setReloadKey((k) => k + 1);
      return;
    }

    setHasError(true);

    onError?.(description);
  };

  const handleHttpError = (event: NativeSyntheticEvent<any>) => {
    const statusCode = event.nativeEvent.statusCode;
    if (statusCode >= 300 && statusCode < 400) return;
    setHasError(true);
    onError?.(`HTTP Error: ${statusCode}`);
  };

  const handleRetry = () => {
    setHasError(false);

    setReloadKey((k) => k + 1);
    onRetry?.();
  };

  const handleShouldStartLoadWithRequest = (request: { url: string }) => {
    const { url: reqUrl } = request;
    console.log("🌐 Navigating to:", reqUrl);
    const isHttp = reqUrl.startsWith("http");
    const isHttps = reqUrl.startsWith("https");

    if (isHttp || isHttps) {
      setCurrentUrl(reqUrl);
      return true;
    }

    const isDeeplink = reqUrl.includes("://") && !reqUrl.startsWith("http");
    if (isDeeplink) {
      onDeeplink?.(reqUrl);
      Linking.openURL(reqUrl).catch(() => {});
      return false;
    }

    Linking.openURL(reqUrl).catch(() => {});
    return false;
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "file_upload" && onFileUpload) {
        onFileUpload(data.file);
      }
    } catch (error) {
      console.log("WebView message parsing error:", error);
    }
  };

  if (hasError) {
    return (
      <SafeAreaView
        style={[styles.safeArea, darkSafeArea && styles.darkSafeArea]}
      >
        <View style={styles.errorContent}>
          <Text style={[styles.errorTitle, darkSafeArea && styles.textLight]}>
            Loading Error
          </Text>
          <Text
            style={[styles.errorMessage, darkSafeArea && styles.textLightDim]}
          >
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
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <WebView
          key={reloadKey}
          ref={webViewRef}
          source={{ uri: currentUrl }}
          onLoadStart={handleLoadStart}
          onError={handleError}
          onHttpError={handleHttpError}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onMessage={handleMessage}
          startInLoadingState={false}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsBackForwardNavigationGestures
          mixedContentMode="compatibility"
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          allowsFullscreenVideo
          allowsProtectedMedia
          allowsAirPlayForMediaPlayback
          allowsPictureInPictureMediaPlayback
          automaticallyAdjustContentInsets={false}
          decelerationRate="normal"
          directionalLockEnabled={false}
          hideKeyboardAccessoryView={false}
          keyboardDisplayRequiresUserAction={false}
          limitsNavigationsToAppBoundDomains={false}
          pullToRefreshEnabled
          renderToHardwareTextureAndroid
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          textZoom={100}
          userAgent={getCustomUserAgent()}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  darkSafeArea: {
    backgroundColor: "black",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    zIndex: 1000,
  },
  darkLoadingOverlay: {
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  textLight: { color: "#fff" },
  textLightDim: { color: "#aaa" },
  retryButton: { minWidth: 120 },
});

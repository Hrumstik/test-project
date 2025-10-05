import React, { memo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useAppState } from "../hooks/useAppState";
import { usePermissionRequest } from "../hooks/usePermissionRequest";
import { AppWebView } from "./AppWebView";
import { NoInternetScreen } from "./NoInternetScreen";
import { AppLoadingIndicator } from "./AppLoadingIndicator";
import { AppConfig, AppMode } from "../types/config";
import { PermissionRequestScreen } from "./PermissionRequestScreen";

interface AppContainerProps {
  config: AppConfig;
  fallbackComponent?: React.ReactNode;
}

const LoadingState: React.FC<{
  mode: string;
  url: string | null;
  isLoading: boolean;
  error: string | null;
  isFirstLaunch: boolean;
}> = ({ mode, url, isLoading, error, isFirstLaunch }) => {
  return (
    <View style={styles.loadingContainer}>
      <AppLoadingIndicator size="large" />
    </View>
  );
};

const ErrorState: React.FC<{
  error: string;
  mode: string;
  url: string | null;
  isLoading: boolean;
  isFirstLaunch: boolean;
  onRetry: () => void;
}> = ({ error, mode, url, isLoading, isFirstLaunch, onRetry }) => {
  return (
    <View style={styles.errorContainer}>
      <NoInternetScreen onRetry={onRetry} onGoToFallback={onRetry} />
    </View>
  );
};

const NoInternetState: React.FC<{
  mode: string;
  url: string | null;
  isLoading: boolean;
  error: string | null;
  isFirstLaunch: boolean;
  onRetry: () => void;
  onGoToFallback: () => void;
}> = ({
  mode,
  url,
  isLoading,
  error,
  isFirstLaunch,
  onRetry,
  onGoToFallback,
}) => {
  return (
    <NoInternetScreen
      onRetry={onRetry}
      onGoToFallback={onGoToFallback}
      isFirstLaunch={isFirstLaunch}
    />
  );
};

const WebViewState: React.FC<{
  url: string;
  mode: string;
  isLoading: boolean;
  error: string | null;
  isFirstLaunch: boolean;
  onError: (error: string) => void;
  onRetry: () => void;
}> = ({ url, mode, isLoading, error, isFirstLaunch, onError, onRetry }) => {
  return <AppWebView url={url} onError={onError} onRetry={onRetry} />;
};

const AppBaseComponent: React.FC<{
  mode: string;
  url: string | null;
  isLoading: boolean;
  error: string | null;
  isFirstLaunch: boolean;
  appComponent?: React.ReactNode;
}> = ({ mode, url, isLoading, error, isFirstLaunch, appComponent }) => {
  return <View style={styles.fallbackContainer}>{appComponent}</View>;
};

const AppContainerComponent: React.FC<AppContainerProps> = ({
  config,
  fallbackComponent,
}) => {
  const {
    mode,
    url,
    isLoading,
    error,
    retry,
    goToFallback,
    isFirstLaunch,
    waitingForPermissions,
    continueAfterPermissions,
  } = useAppState(config);

  const {
    showPermissionRequest,
    handlePermissionAccept,
    handlePermissionDecline,
    initializePermissionRequest,
  } = usePermissionRequest();

  const handleWebViewError = useCallback((webViewError: string) => {
    console.error("🚨 AppContainer: WebView error received:", webViewError);
  }, []);

  const handleRetry = useCallback(() => {
    retry();
  }, [retry]);

  React.useEffect(() => {
    if (waitingForPermissions) {
      initializePermissionRequest();
    } else {
      console.log(
        "📱 AppContainer: Not waiting for permissions, skipping permission request"
      );
    }
  }, [waitingForPermissions, initializePermissionRequest]);

  if (showPermissionRequest) {
    return (
      <PermissionRequestScreen
        onAccept={async () => {
          const fcmToken = await handlePermissionAccept();
          await continueAfterPermissions(fcmToken || undefined);
        }}
        onDecline={async () => {
          await handlePermissionDecline();
          await continueAfterPermissions(undefined);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingState
        mode={mode}
        url={url}
        isLoading={isLoading}
        error={error}
        isFirstLaunch={isFirstLaunch}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        mode={mode}
        url={url}
        isLoading={isLoading}
        isFirstLaunch={isFirstLaunch}
        onRetry={handleRetry}
      />
    );
  }

  if (mode === AppMode.NO_INTERNET) {
    return (
      <NoInternetState
        mode={mode}
        url={url}
        isLoading={isLoading}
        error={error}
        isFirstLaunch={isFirstLaunch}
        onRetry={handleRetry}
        onGoToFallback={goToFallback}
      />
    );
  }

  if (mode === AppMode.WEBVIEW && url) {
    return (
      <WebViewState
        url={url}
        mode={mode}
        isLoading={isLoading}
        error={error}
        isFirstLaunch={isFirstLaunch}
        onError={handleWebViewError}
        onRetry={handleRetry}
      />
    );
  }

  if (mode === AppMode.APP) {
    return (
      <AppBaseComponent
        mode={mode}
        url={url}
        isLoading={isLoading}
        error={error}
        isFirstLaunch={isFirstLaunch}
        appComponent={fallbackComponent}
      />
    );
  }

  return (
    <LoadingState
      mode={mode}
      url={url}
      isLoading={isLoading}
      error={error}
      isFirstLaunch={isFirstLaunch}
    />
  );
};

AppContainerComponent.displayName = "AppContainer";

export const AppContainer = memo(AppContainerComponent);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  errorContainer: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  defaultFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import * as Network from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppsFlyerService } from "../services/AppsFlyerService";
import { ConfigService } from "../services/ConfigService";
import { AppMode, AppConfig } from "../types/config";
import { usePushNotifications } from "./usePushNotifications";
import { useTrackingTransparency } from "./useTrackingTransparency";

interface UseAppStateReturn {
  mode: AppMode;
  url: string | null;
  isLoading: boolean;
  error: string | null;
  isFirstLaunch: boolean;
  waitingForPermissions: boolean;
  retry: () => Promise<void>;
  goToFallback: () => Promise<void>;
  continueAfterPermissions: (token?: string) => Promise<void>;
}

export const useAppState = (config: AppConfig): UseAppStateReturn => {
  const [mode, setMode] = useState<AppMode>(AppMode.LOADING);
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [waitingForPermissions, setWaitingForPermissions] = useState(false);

  const appState = useMemo(
    () => ({
      mode,
      url,
      isLoading,
      error,
      isFirstLaunch,
      waitingForPermissions,
    }),
    [mode, url, isLoading, error, isFirstLaunch, waitingForPermissions]
  );

  const isInitialized = useRef(false);
  const initializationPromise = useRef<Promise<void> | null>(null);

  const services = useMemo(() => {
    return {
      appsFlyerService: AppsFlyerService.getInstance(config),
      configService: ConfigService.getInstance(config),
    };
  }, [config]);

  const { appsFlyerService, configService } = services;

  const { fcmToken, getToken } = usePushNotifications(false);

  const { requestPermission: requestTrackingPermission } =
    useTrackingTransparency();

  const checkInternetConnection = useCallback(async (): Promise<boolean> => {
    try {
      const state = await Network.getNetworkStateAsync();
      return !!(state.isConnected && state.isInternetReachable);
    } catch {
      return false;
    }
  }, []);

  const handleSavedConfig = useCallback(
    async (savedConfig: any) => {
      if (savedConfig?.configRequestFailed) {
        setMode(AppMode.APP);
        await configService.setAppMode(AppMode.APP);
        await configService.markFirstLaunchComplete();
        setIsLoading(false);
        return true;
      }

      if (
        savedConfig?.mode === AppMode.WEBVIEW ||
        savedConfig?.mode === AppMode.APP
      ) {
        if (savedConfig.url && configService.isUrlExpired(savedConfig)) {
          console.log("Saved URL is expired, will request new config");
          return false;
        }
        setMode(savedConfig.mode);
        if (savedConfig.url) {
          setUrl(savedConfig.url);
        }
        setIsLoading(false);
        return true;
      }

      return false;
    },
    [configService]
  );

  const handleOrganicRetry = useCallback(
    async (conversionData: any, token?: string | null) => {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      try {
        await appsFlyerService.retryConversionData();
        const retryData = appsFlyerService.getConversionData();
        console.log("retryData", retryData);
        console.log("fcmToken retry", token);

        const response = await configService.requestConfig(token || undefined);

        console.log("response retry config", response);

        if (response.ok && response.url) {
          setMode(AppMode.WEBVIEW);
          setUrl(response.url);
          await configService.setAppMode(AppMode.WEBVIEW);
          await configService.markFirstLaunchComplete();
        } else {
          setMode(AppMode.APP);
          await configService.setAppMode(AppMode.APP);
          await configService.markFirstLaunchComplete();
        }
        setIsLoading(false);
        return true;
      } catch {
        setMode(AppMode.APP);
        await configService.setAppMode(AppMode.APP);
        await configService.markFirstLaunchComplete();
        setIsLoading(false);
        return true;
      }
    },
    [appsFlyerService, configService]
  );

  const handleFirstLaunchWithToken = useCallback(
    async (token: string | null) => {
      setIsFirstLaunch(true);

      let fcmToken: string | null | undefined = token;

      console.log("here is token", token);

      if (!fcmToken) {
        try {
          fcmToken = await getToken();
        } catch (error) {
          console.log("Failed to get FCM token:", error);
        }
      }

      try {
        const savedConfig = await configService.getSavedConfigData();
        const shouldReturn = await handleSavedConfig(savedConfig);
        if (shouldReturn) return;

        let conversionData = null;
        try {
          conversionData = await appsFlyerService.waitForConversionData(5000);
        } catch {
          console.log("waitForConversionData failed");
        }

        console.log("conversionData ???", conversionData);

        if (conversionData?.af_status === "Organic") {
          const shouldReturn = await handleOrganicRetry(
            conversionData,
            fcmToken
          );
          if (shouldReturn) return;
        }

        const response = await configService.requestConfig(
          fcmToken || undefined
        );
        if (response.ok && response.url) {
          setMode(AppMode.WEBVIEW);
          setUrl(response.url);
          await configService.setAppMode(AppMode.WEBVIEW);
          await configService.markFirstLaunchComplete();
        } else {
          setMode(AppMode.APP);
          await configService.setAppMode(AppMode.APP);
          await configService.markFirstLaunchComplete();
        }
      } catch {
        setMode(AppMode.APP);
        await configService.setAppMode(AppMode.APP);
        await configService.markFirstLaunchComplete();
      } finally {
        setIsLoading(false);
      }
    },
    [
      appsFlyerService,
      configService,
      handleSavedConfig,
      handleOrganicRetry,
      getToken,
    ]
  );

  const handleSubsequentLaunch = useCallback(async () => {
    setIsFirstLaunch(false);
    try {
      const notificationUrl = await AsyncStorage.getItem("notification_url");
      if (notificationUrl) {
        setMode(AppMode.WEBVIEW);
        setUrl(notificationUrl);
        await AsyncStorage.removeItem("notification_url");
        return;
      }

      const savedMode = await configService.getAppMode();

      if (savedMode === AppMode.WEBVIEW) {
        const savedConfig = await configService.getSavedConfigData();
        if (savedConfig?.url) {
          try {
            const response = await configService.requestConfig(fcmToken);
            if (response.url) {
              setMode(AppMode.WEBVIEW);
              setUrl(response.url);
            } else {
              setMode(AppMode.WEBVIEW);
              setUrl(savedConfig.url);
            }
          } catch {
            setMode(AppMode.WEBVIEW);
            setUrl(savedConfig.url);
          }
        } else {
          setMode(AppMode.APP);
        }
      } else {
        setMode(AppMode.APP);
      }
    } catch {
      setMode(AppMode.APP);
    }
  }, [configService, fcmToken]);

  const initializeApp = useCallback(async () => {
    if (isInitialized.current) {
      return;
    }

    if (initializationPromise.current) {
      return initializationPromise.current;
    }

    isInitialized.current = true;
    setIsLoading(true);
    setError(null);

    const initPromise = (async () => {
      try {
        if (Platform.OS === "ios") {
          try {
            await requestTrackingPermission();
          } catch {
            console.log("Tracking permission request failed");
          }
        }

        try {
          await appsFlyerService.initialize(
            config.appsFlyerDevKey,
            config.storeId
          );
        } catch {
          console.log("AppsFlyer initialization failed");
        }

        const isFirst = await configService.isFirstLaunch();
        setIsFirstLaunch(isFirst);

        const hasInternetConnection = await checkInternetConnection();

        if (!hasInternetConnection) {
          setMode(AppMode.NO_INTERNET);
          setIsLoading(false);
          return;
        }

        if (isFirst) {
          setWaitingForPermissions(true);
          setIsLoading(false);
        } else {
          await handleSubsequentLaunch();
        }
      } catch {
        setMode(AppMode.APP);
        await configService.setAppMode(AppMode.APP);
      } finally {
        setIsLoading(false);
        initializationPromise.current = null;
      }
    })();

    initializationPromise.current = initPromise;
    return initPromise;
  }, [
    config,
    checkInternetConnection,
    appsFlyerService,
    configService,
    handleSubsequentLaunch,
    requestTrackingPermission,
  ]);

  const retry = useCallback(async () => {
    isInitialized.current = false;
    initializationPromise.current = null;
    await initializeApp();
  }, [initializeApp]);

  const goToFallback = useCallback(async () => {
    setMode(AppMode.APP);
    await configService.setAppMode(AppMode.APP);
    await configService.markFirstLaunchComplete();
    setIsLoading(false);
  }, [configService]);

  const continueAfterPermissions = useCallback(
    async (token?: string) => {
      setWaitingForPermissions(false);
      setIsLoading(true);

      await handleFirstLaunchWithToken(token || null);
    },
    [handleFirstLaunchWithToken]
  );

  useEffect(() => {
    if (!isInitialized.current && !initializationPromise.current) {
      initializeApp();
    }
  }, [initializeApp]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && mode === AppMode.NO_INTERNET) {
        checkInternetConnection().then((hasInternet) => {
          if (hasInternet) {
            initializeApp();
          }
        });
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [mode, checkInternetConnection, initializeApp]);

  return {
    mode: appState.mode,
    url: appState.url,
    isLoading: appState.isLoading,
    error: appState.error,
    isFirstLaunch: appState.isFirstLaunch,
    waitingForPermissions: appState.waitingForPermissions,
    retry,
    goToFallback,
    continueAfterPermissions,
  };
};

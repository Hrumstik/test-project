import React, { useEffect, useCallback } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getMessaging,
  getToken,
  requestPermission,
  AuthorizationStatus,
  getAPNSToken,
  onMessage,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification,
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";

export const usePushNotifications = (shouldInitialize: boolean = true) => {
  const [fcmToken, setFcmToken] = React.useState<string | undefined>(undefined);
  const messaging = getMessaging();

  const requestPermissionLocal = async (): Promise<boolean> => {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (!hasPermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }
    }

    const authStatus = await requestPermission(messaging);
    const isAuthorized =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    return isAuthorized;
  };

  const getTokenLocal = useCallback(async (): Promise<string | undefined> => {
    try {
      if (Platform.OS === "ios") {
        const apnsToken = await getAPNSToken(messaging);
        if (!apnsToken) {
          return;
        }
      }

      const fcmToken = await getToken(messaging);

      setFcmToken(fcmToken);

      return fcmToken;
    } catch (error) {
      console.log("Error fetching push notification token:", error);
    }
  }, [messaging]);

  const handleForegroundNotification = useCallback(() => {
    const unsubscribe = onMessage(
      messaging,
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log("📱 New notification received:", remoteMessage);
      }
    );
    return unsubscribe;
  }, [messaging]);

  const handleNotificationWithUrl = (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ) => {
    if (remoteMessage.data?.url) {
      AsyncStorage.setItem(
        "notification_url",
        remoteMessage.data.url as string
      );
      AsyncStorage.removeItem("saved_config");
    }
  };

  const handleBackgroundNotifications = useCallback(() => {
    setBackgroundMessageHandler(
      messaging,
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        // Background message received
      }
    );

    onNotificationOpenedApp(
      messaging,
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          handleNotificationWithUrl(remoteMessage);
        }
      }
    );

    getInitialNotification(messaging).then((remoteMessage) => {
      if (remoteMessage) {
        handleNotificationWithUrl(remoteMessage);
      }
    });
  }, [messaging]);

  useEffect(() => {
    if (!shouldInitialize) {
      return;
    }

    handleBackgroundNotifications();
    const unsubscribe = handleForegroundNotification();

    return () => {
      unsubscribe();
    };
  }, [
    shouldInitialize,
    handleBackgroundNotifications,
    handleForegroundNotification,
  ]);

  const initializePushNotifications = useCallback(async () => {
    handleBackgroundNotifications();
    const unsubscribe = handleForegroundNotification();
    return unsubscribe;
  }, [handleBackgroundNotifications, handleForegroundNotification]);

  return {
    fcmToken,
    requestPermission: requestPermissionLocal,
    getToken: getTokenLocal,
    initializePushNotifications,
  };
};

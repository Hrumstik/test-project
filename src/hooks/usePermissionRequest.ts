import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePushNotifications } from "./usePushNotifications";

export const usePermissionRequest = () => {
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const { requestPermission, getToken, initializePushNotifications } =
    usePushNotifications(false);

  const checkShouldShowPermissionRequest =
    useCallback(async (): Promise<boolean> => {
      try {
        const permissionGranted = await AsyncStorage.getItem(
          "push_permission_granted"
        );
        if (permissionGranted === "true") {
          return false;
        }

        const lastRequestTime = await AsyncStorage.getItem(
          "push_permission_last_request"
        );
        if (!lastRequestTime) {
          return true;
        }

        const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
        const lastRequest = parseInt(lastRequestTime);

        return lastRequest < threeDaysAgo;
      } catch (error) {
        console.error("Error checking permission request time:", error);
        return true;
      }
    }, []);

  const handlePermissionAccept = useCallback(async () => {
    let fcmToken = null;

    try {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        await AsyncStorage.setItem("push_permission_granted", "true");

        try {
          fcmToken = await getToken();
          await initializePushNotifications();
        } catch (error) {
          console.error("Error getting FCM token:", error);
        }
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    }

    await AsyncStorage.setItem(
      "push_permission_last_request",
      Date.now().toString()
    );
    setShowPermissionRequest(false);

    return fcmToken;
  }, [requestPermission, getToken, initializePushNotifications]);

  const handlePermissionDecline = useCallback(async () => {
    await AsyncStorage.setItem(
      "push_permission_last_request",
      Date.now().toString()
    );
    setShowPermissionRequest(false);
  }, []);

  const initializePermissionRequest = useCallback(async () => {
    const shouldShow = await checkShouldShowPermissionRequest();
    if (shouldShow) {
      setShowPermissionRequest(true);
    }
  }, [checkShouldShowPermissionRequest]);

  return {
    showPermissionRequest,
    handlePermissionAccept,
    handlePermissionDecline,
    initializePermissionRequest,
  };
};

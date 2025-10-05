import { useState, useEffect } from "react";
import { Platform } from "react-native";
import {
  requestTrackingPermission,
  getTrackingStatus,
} from "react-native-tracking-transparency";

export const useTrackingTransparency = () => {
  const [trackingStatus, setTrackingStatus] =
    useState<string>("not-determined");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios") {
      checkTrackingStatus();
    }
  }, []);

  const checkTrackingStatus = async () => {
    try {
      const status = await getTrackingStatus();
      setTrackingStatus(status);
    } catch (error) {
      console.error("Error checking tracking status:", error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS !== "ios") {
      return true;
    }

    setIsLoading(true);
    try {
      const status = await requestTrackingPermission();
      setTrackingStatus(status);

      const isAuthorized = status === "authorized";

      return isAuthorized;
    } catch (error) {
      console.error("Error requesting tracking permission:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const canTrack = trackingStatus === "authorized";

  return {
    trackingStatus,
    isLoading,
    canTrack,
    requestPermission,
    checkTrackingStatus,
  };
};

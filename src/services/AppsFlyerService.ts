import { Platform } from "react-native";
import { AppsFlyerConversionData, AppConfig } from "../types/config";

let appsFlyer: any = null;

interface ConversionDataResponse {
  status: string;
  type: string;
  data: AppsFlyerConversionData;
}

const loadAppsFlyer = async (): Promise<any> => {
  if (appsFlyer) {
    return appsFlyer;
  }

  try {
    const appsFlyerModule = await import("react-native-appsflyer");
    appsFlyer = appsFlyerModule.default || appsFlyerModule;
    return appsFlyer;
  } catch (error) {
    console.error("Error loading AppsFlyer:", error);
    return null;
  }
};

export class AppsFlyerService {
  private static instance: AppsFlyerService;
  private initialized = false;
  private conversionData: AppsFlyerConversionData | null = null;
  private afId: string | null = null;
  private config: AppConfig | null = null;

  private constructor() {}

  public static getInstance(config?: AppConfig): AppsFlyerService {
    if (!AppsFlyerService.instance) {
      AppsFlyerService.instance = new AppsFlyerService();
    }

    if (
      config &&
      (!AppsFlyerService.instance.config ||
        AppsFlyerService.instance.config.appsFlyerDevKey !==
          config.appsFlyerDevKey ||
        AppsFlyerService.instance.config.storeId !== config.storeId)
    ) {
      AppsFlyerService.instance.config = config;
    }

    return AppsFlyerService.instance;
  }

  public async initialize(devKey: string, appId: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const appsFlyerSDK = await loadAppsFlyer();
      if (appsFlyerSDK) {
        appsFlyerSDK.initSdk(
          {
            devKey,
            appId,
            isDebug: false,
          },
          (result: any) => {
            this.initialized = true;
            this.setupConversionDataListener();
          },
          (error: any) => {
            throw error;
          }
        );

        this.afId = await this.getAppsFlyerId();
      } else {
        throw new Error("AppsFlyer not available");
      }
    } catch (error) {
      throw error;
    }
  }

  public async getAppsFlyerId(): Promise<string> {
    try {
      const appsFlyerSDK = await loadAppsFlyer();
      if (appsFlyerSDK) {
        return new Promise<string>((resolve) => {
          appsFlyerSDK.getAppsFlyerUID(
            (error: Error | null, result: string) => {
              if (error) {
                resolve("");
              } else {
                resolve(result || "");
              }
            }
          );
        });
      } else {
        return "";
      }
    } catch (error) {
      console.error("Error getting AppsFlyer ID:", error);
      return "";
    }
  }

  private setupConversionDataListener(): void {
    try {
      if (appsFlyer) {
        appsFlyer.onInstallConversionData((data: ConversionDataResponse) => {
          if (data.data) {
            this.conversionData = { ...data.data };

            if (this.conversionData.af_status === "Organic") {
              setTimeout(() => {
                this.retryConversionData();
              }, 5000);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error setting up conversion data listener:", error);
    }
  }

  public async retryConversionData(): Promise<void> {
    try {
      const afId = await this.getAppsFlyerId();
      if (!afId) {
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("https://api2.appsflyer.com/gcd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          af_id: afId,
          dev_key: this.config?.appsFlyerDevKey,
          app_id: this.config?.storeId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const updatedData = await response.json();
        if (updatedData?.data) {
          this.conversionData = { ...updatedData.data };
        }
      }
    } catch (error: unknown) {
      console.error("Error retrying conversion data:", error);
    }
  }

  public getConversionData(): AppsFlyerConversionData | null {
    return this.conversionData;
  }

  public getFallbackConversionData(): AppsFlyerConversionData {
    return {
      is_first_launch: true,
      media_source: "organic",
      campaign: "fallback",
      af_status: "Non-organic",
      af_channel: "organic",
    };
  }

  public getAppsFlyerIdSync(): string | null {
    return this.afId;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public async waitForConversionData(
    timeout: number = 10000
  ): Promise<AppsFlyerConversionData | null> {
    return new Promise((resolve) => {
      if (this.conversionData) {
        return resolve(this.conversionData);
      }

      const startTime = Date.now();
      const interval = setInterval(() => {
        if (this.conversionData) {
          clearInterval(interval);
          resolve(this.conversionData);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }

  public async logEvent(
    eventName: string,
    eventValues?: Record<string, unknown>
  ): Promise<void> {
    try {
      const appsFlyerSDK = await loadAppsFlyer();
      if (appsFlyerSDK) {
        await appsFlyerSDK.logEvent(eventName, eventValues || {});
      }
    } catch (error) {
      console.error("Error logging event:", error);
    }
  }

  public getPlatformInfo() {
    return {
      os: Platform.OS === "ios" ? "iOS" : "Android",
      bundleId: "com.hrumstik.flavorly",
      storeId: "com.hrumstik.flavorly",
    };
  }
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import {
  ConfigRequestParams,
  ConfigResponse,
  SavedConfigData,
  AppConfig,
  AppMode,
} from "../types/config";
import { AppsFlyerService } from "./AppsFlyerService";

const STORAGE_KEY = "saved_config_data";

export class ConfigService {
  private static instance: ConfigService;
  private readonly config: AppConfig;

  private constructor(config: AppConfig) {
    this.config = config;
  }

  public static getInstance(config: AppConfig): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService(config);
    } else {
      if (
        ConfigService.instance.config.configEndpoint !==
          config.configEndpoint ||
        ConfigService.instance.config.appsFlyerDevKey !==
          config.appsFlyerDevKey ||
        ConfigService.instance.config.storeId !== config.storeId
      ) {
        ConfigService.instance = new ConfigService(config);
      }
    }
    return ConfigService.instance;
  }

  public async requestConfig(
    pushToken?: string,
    locale?: string
  ): Promise<ConfigResponse> {
    console.log("requestConfig try");
    const savedData = await this.getSavedConfigData();

    if (savedData?.configRequestFailed) {
      return {
        ok: false,
        message: "Previous config request failed",
      };
    }

    try {
      const appsFlyerService = AppsFlyerService.getInstance(this.config);
      const conversionData = appsFlyerService.getConversionData();
      console.log("conversionData", conversionData);
      const afId = await appsFlyerService.getAppsFlyerId();
      const resolvedAfId = afId || appsFlyerService.getAppsFlyerIdSync() || "";
      console.log("resolvedAfId", resolvedAfId);
      const platformInfo = appsFlyerService.getPlatformInfo();
      const resolvedLocale = this.resolveLocale(locale);

      const requestParams: ConfigRequestParams = {
        ...(conversionData ? { ...conversionData } : {}),
        af_id: resolvedAfId,
        bundle_id: this.config.bundleId,
        os: platformInfo.os as "Android" | "iOS",
        store_id: this.config.storeId,
        locale: resolvedLocale,
        push_token: pushToken ?? null,
        firebase_project_id: this.config.firebaseProjectId,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(this.config.configEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestParams),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: ConfigResponse = await response.json();

      console.log("data", data);

      if (!data.ok) {
        await this.saveConfigData({
          url: null,
          expires: null,
          mode: AppMode.APP,
          isFirstLaunch: false,
          configRequestFailed: true,
        });
        return data;
      }

      let validUrl = data.url;
      if (
        validUrl &&
        !validUrl.startsWith("http://") &&
        !validUrl.startsWith("https://")
      ) {
        validUrl = `https://${validUrl}`;
      }

      if (validUrl && validUrl.length > 0) {
        await this.saveConfigData({
          url: validUrl,
          expires: data.expires || Math.floor(Date.now() / 1000) + 24 * 60 * 60,
          mode: AppMode.WEBVIEW,
          isFirstLaunch: false,
          configRequestFailed: false,
        });
      } else {
        await this.saveConfigData({
          url: null,
          expires: null,
          mode: AppMode.APP,
          isFirstLaunch: false,
          configRequestFailed: true,
        });
      }

      return data;
    } catch (error) {
      console.log("ConfigService requestConfig error:", error);

      await this.saveConfigData({
        url: null,
        expires: null,
        mode: AppMode.APP,
        isFirstLaunch: false,
        configRequestFailed: true,
      });

      return {
        ok: false,
        message: "Config request failed",
      };
    }
  }

  public async saveConfigData(data: SavedConfigData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.log("Failed to save config data");
    }
  }

  public async getSavedConfigData(): Promise<SavedConfigData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as SavedConfigData;
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  public isUrlExpired(savedData: SavedConfigData): boolean {
    if (savedData.expires === null) {
      return false;
    }
    const now = Math.floor(Date.now() / 1000);
    return now >= savedData.expires;
  }

  private resolveLocale(locale?: string): string {
    if (locale) {
      return locale;
    }

    try {
      const locales = getLocales();
      if (Array.isArray(locales) && locales.length > 0) {
        const primary = locales[0];
        return primary.languageTag || primary.languageCode || "en";
      }
    } catch {
      console.log("Failed to resolve device locale");
    }

    return "en";
  }

  public async clearSavedData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      console.log("Failed to clear saved config data");
    }
  }

  public async getCurrentUrl(): Promise<string | null> {
    try {
      const savedData = await this.getSavedConfigData();

      if (!savedData) {
        const response = await this.requestConfig();
        return response.ok ? response.url || null : null;
      }

      if (!this.isUrlExpired(savedData)) {
        return savedData.url;
      }

      const response = await this.requestConfig();
      if (response.ok && response.url) {
        return response.url;
      }

      return savedData.url;
    } catch {
      return null;
    }
  }

  public async getAppMode(): Promise<AppMode | null> {
    try {
      const savedData = await this.getSavedConfigData();
      if (
        savedData?.mode === AppMode.WEBVIEW ||
        savedData?.mode === AppMode.APP
      ) {
        return savedData.mode;
      }
      return null;
    } catch {
      return null;
    }
  }

  public async setAppMode(mode: AppMode): Promise<void> {
    try {
      const savedData = await this.getSavedConfigData();
      if (savedData) {
        savedData.mode = mode;
        await this.saveConfigData({
          ...savedData,
          configRequestFailed: savedData.configRequestFailed || false,
        });
      }
    } catch {}
  }

  public async isFirstLaunch(): Promise<boolean> {
    try {
      const savedData = await this.getSavedConfigData();
      return savedData?.isFirstLaunch ?? true;
    } catch {
      return true;
    }
  }

  public async markFirstLaunchComplete(): Promise<void> {
    try {
      const savedData = await this.getSavedConfigData();
      if (savedData) {
        await this.saveConfigData({
          ...savedData,
          isFirstLaunch: false,
          configRequestFailed: savedData.configRequestFailed || false,
        });
      }
    } catch {}
  }

  public async updatePushToken(pushToken: string): Promise<void> {
    try {
      await this.requestConfig(pushToken);
    } catch {}
  }
}

export interface AppsFlyerConversionData {
  adset?: string;
  af_adset?: string;
  adgroup?: string;
  campaign_id?: string;
  af_status?: "Organic" | "Non-organic";
  agency?: string;
  af_sub3?: string | null;
  af_siteid?: string | null;
  adset_id?: string;
  is_fb?: boolean;
  is_first_launch?: boolean | string;
  click_time?: string;
  iscache?: boolean;
  ad_id?: string;
  af_sub1?: string;
  campaign?: string;
  is_paid?: boolean;
  af_sub4?: string;
  adgroup_id?: string;
  is_mobile_data_terms_signed?: boolean;
  af_channel?: string;
  af_sub5?: string | null;
  media_source?: string;
  install_time?: string;
  af_sub2?: string | null;
  [key: string]: unknown;
}

export interface ConfigRequestParams extends AppsFlyerConversionData {
  af_id: string;
  bundle_id: string;
  os: "Android" | "iOS";
  store_id: string;
  locale: string;
  push_token: string | null;
  firebase_project_id?: string;
}

export interface ConfigResponse {
  ok: boolean;
  url?: string;
  expires?: number;
  message?: string;
  status?: number;
}

export interface SavedConfigData {
  url: string | null;
  expires: number | null;
  mode: AppMode;
  isFirstLaunch: boolean;
  configRequestFailed: boolean;
}

export interface AppConfig {
  configEndpoint: string;
  configUrl?: string;
  fallbackUrl?: string;
  bundleId: string;
  storeId: string;
  firebaseProjectId: string;
  appsFlyerDevKey: string;
}

export enum AppMode {
  WEBVIEW = "webview",
  APP = "app",
  LOADING = "loading",
  NO_INTERNET = "no-internet",
}

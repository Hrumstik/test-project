import { AppConfig } from "../types/config";

export const appConfig: AppConfig = {
  configEndpoint: "https://pwac.world/recipes/check",
  bundleId: "com.hrumstik.flavorly",
  storeId: "6752867842",
  firebaseProjectId: "flavorly-88ad4",
  appsFlyerDevKey: "SJHRhM3fY6WCmyVnYiRcQH",
};

export const getAppConfig = (): AppConfig => {
  return appConfig;
};

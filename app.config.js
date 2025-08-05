// app.config.js
import fs from 'fs';
import path from 'path';

const env = process.env.ENVFILE || '.env';
const envFile = path.resolve(env);

require('dotenv').config({ path: envFile });

export default ({ config }) => {

  let variantConfig = {};
  const appVariant = process.env.APP_VARIANT;

  if (appVariant) {
    try {
      const configPath = path.resolve(__dirname, `config/sae/production/${appVariant}.json`);
      variantConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error(`Error loading variant config for ${appVariant}:`, error);
    }
  }


  return {
    ...config,
    expo: {
      name: variantConfig.name || config.name,
      slug: variantConfig.slug || config.slug,
      version: "1.0.0",
      orientation: "portrait",
      icon: variantConfig.icon || "./assets/icon.png",
      userInterfaceStyle: "light",
      newArchEnabled: true,
      splash: {
        image: variantConfig.splash.image || "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: variantConfig.splash.backgroundColor || "#ffffff"
      },
      ios: {
        supportsTablet: false,
        bundleIdentifier: variantConfig.ios.bundleIdentifier || "",
        infoPlist: {
          NSFaceIDUsageDescription: "Face ID is used to authenticate the user",
          NSLocationWhenInUseUsageDescription: "Location is required to verify employee attendance at work premises.",
          NSLocationAlwaysAndWhenInUseUsageDescription: "Location is required to verify employee attendance at work premises.",
          NSLocationUsageDescription: "Location is required to verify employee attendance at work premises.",
          UIBackgroundModes: ["location"],
          ITSAppUsesNonExemptEncryption: false
        }
      },
      android: {
        adaptiveIcon: {
          foregroundImage: variantConfig.android.adaptiveIcon.foregroundImage || "./assets/adaptive-icon.png",
          backgroundColor: variantConfig.android.adaptiveIcon.backgroundColor || "#ffffff"
        },
        edgeToEdgeEnabled: true,
        package: variantConfig.android.package || "",
        versionCode: 1,
        permissions: [
          "ACCESS_FINE_LOCATION",
          "ACCESS_COARSE_LOCATION"
        ]
      },
      extra: {
        eas: {
          projectId: variantConfig.extra.eas.projectId || "",
          preview: {
            channel: variantConfig.extra.eas.preview.channel || "preview",
            distribution: variantConfig.extra.eas.preview.distribution || "internal",
            android: {
              buildType: variantConfig.extra.eas.preview.android.buildType || "apk"
            }
          },
          env: {
            APP_VARIANT: process.env.APP_VARIANT,
            SAE_EMPLOYEEAPP_API_URL: process.env.SAE_EMPLOYEEAPP_API_URL,
            SAE_EMPLOYEEAPP_AUTHENTICATION_KEY: process.env.SAE_EMPLOYEEAPP_AUTHENTICATION_KEY,
            SAE_EMPLOYEEAPP_AUTHENTICATION_USER_KEY: process.env.SAE_EMPLOYEEAPP_AUTHENTICATION_USER_KEY,
            SAE_EMPLOYEEAPP_THEME_STORAGE_KEY: process.env.SAE_EMPLOYEEAPP_THEME_STORAGE_KEY
          }
        },
        APP_VARIANT: process.env.APP_VARIANT,
        SAE_EMPLOYEEAPP_API_URL: process.env.SAE_EMPLOYEEAPP_API_URL,
        SAE_EMPLOYEEAPP_AUTHENTICATION_KEY: process.env.SAE_EMPLOYEEAPP_AUTHENTICATION_KEY,
        SAE_EMPLOYEEAPP_AUTHENTICATION_USER_KEY: process.env.SAE_EMPLOYEEAPP_AUTHENTICATION_USER_KEY,
        SAE_EMPLOYEEAPP_THEME_STORAGE_KEY: process.env.SAE_EMPLOYEEAPP_THEME_STORAGE_KEY
      },
      owner: "wilvardosae",
      runtimeVersion: {
        policy: "appVersion"
      },
      updates: {
        url: variantConfig.updates.url || "https://u.expo.dev/",
        enabled: true,
        fallbackToCacheTimeout: 0,
        checkAutomatically: "ON_LOAD"
      }
    }
  };
};

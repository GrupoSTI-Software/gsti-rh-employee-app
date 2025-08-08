import fs from 'fs'
import path from 'path'

const env = process.env.ENVFILE || '.env'
const envFile = path.resolve(env)

require('dotenv').config({ path: envFile })

export default ({ config }) => {

  let variantConfig = {}
  const appVariant = process.env.APP_VARIANT

  if (appVariant) {
    try {
      const configPath = path.resolve(__dirname, `config/${appVariant}/app-config.json`)
      variantConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    } catch (error) {
      console.error(`Error loading variant config for ${appVariant}:`, error)
    }
  }


  return {
    ...config,
    expo: {
      name: variantConfig.name || config.name,
      slug: variantConfig.slug || config.slug,
      version: "1.1.0",
      orientation: "portrait",
      icon: variantConfig.icon || "",
      userInterfaceStyle: "light",
      newArchEnabled: true,
      splash: {
        image: variantConfig.splash.image || "",
        resizeMode: "contain",
        backgroundColor: variantConfig.splash.backgroundColor || "#ffffff"
      },
      ios: {
        supportsTablet: false,
        bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER,
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
        package: process.env.ANDROID_PACKAGE_NAME,
        versionCode: 1,
        permissions: [
          "ACCESS_FINE_LOCATION",
          "ACCESS_COARSE_LOCATION"
        ]
      },
      extra: {
        eas: {
          projectId: process.env.EAS_PROJECT_ID,
          preview: {
            channel: "preview",
            distribution: "internal",
            android: {
              buildType: "apk"
            }
          },
          production: {
            channel: "production",
            distribution: "store"
          },
          env: {
            APP_VARIANT: process.env.APP_VARIANT,
            API_URL: process.env.API_URL,
            AUTHENTICATION_KEY: process.env.AUTHENTICATION_KEY,
            AUTHENTICATION_USER_KEY: process.env.AUTHENTICATION_USER_KEY,
            THEME_STORAGE_KEY: process.env.THEME_STORAGE_KEY
          }
        },
        APP_VARIANT: process.env.APP_VARIANT,
        API_URL: process.env.API_URL,
        AUTHENTICATION_KEY: process.env.AUTHENTICATION_KEY,
        AUTHENTICATION_USER_KEY: process.env.AUTHENTICATION_USER_KEY,
        THEME_STORAGE_KEY: process.env.THEME_STORAGE_KEY
      },
      owner: "wilvardosae",
      runtimeVersion: {
        policy: "appVersion"
      },
      updates: {
        url: process.env.EAS_PREVIEW_URL,
        enabled: true,
        fallbackToCacheTimeout: 0,
        checkAutomatically: "ON_LOAD"
      }
    }
  }
}

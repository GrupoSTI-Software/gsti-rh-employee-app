import { Platform } from 'react-native'
import * as Updates from 'expo-updates'

/**
 * Service to handle Expo OTA updates
 */
export class ExpoUpdatesService {
  /**
   * Checks if the app is running on web platform
   * @returns boolean - true if running on web
   */
  static isWeb(): boolean {
    return Platform.OS === 'web'
  }

  /**
   * Checks if the app is running in development mode (Expo Go)
   * @returns boolean - true if in development mode
   */
  static isInDevelopmentMode(): boolean {
    // On web, always return true to skip native updates
    if (this.isWeb()) {
      return true
    }
    // In Expo Go, the channel will be null or undefined
    return !Updates.channel
  }

  /**
   * Checks for updates and returns if an update is available
   * @returns Promise<boolean> - true if an update is available
   */
  static async checkForUpdates(): Promise<boolean> {
    // Skip update check in development mode
    if (this.isInDevelopmentMode()) {
      return false
    }

    try {
      const update = await Updates.checkForUpdateAsync()
      return update.isAvailable
    } catch (error) {
      console.error('Error checking for updates:', error)
      return false
    }
  }

  /**
   * Fetches and installs an available update
   * @returns Promise<boolean> - true if update was successfully installed
   */
  static async fetchUpdateAsync(): Promise<boolean> {
    // Skip update fetch in development mode
    if (this.isInDevelopmentMode()) {
      return false
    }

    try {
      const { isNew } = await Updates.fetchUpdateAsync()
      return isNew
    } catch (error) {
      console.error('Error fetching update:', error)
      return false
    }
  }

  /**
   * Reloads the app to apply the installed update
   */
  static async reloadApp(): Promise<void> {
    // Skip reload in development mode
    if (this.isInDevelopmentMode()) {
      return
    }

    try {
      await Updates.reloadAsync()
    } catch (error) {
      console.error('Error reloading app:', error)
    }
  }

  /**
   * Checks, downloads and applies updates if available
   * @param showAlert - Optional callback to show an alert before reloading
   * @returns Promise<void>
   */
  static async checkAndApplyUpdates(
    showAlert?: (onReload: () => void) => void
  ): Promise<void> {
    // Skip updates in development mode
    if (this.isInDevelopmentMode()) {
      return
    }

    try {
      // Check if update is available
      const isUpdateAvailable = await this.checkForUpdates()
      
      if (isUpdateAvailable) {
        // Fetch the update
        const isUpdateNew = await this.fetchUpdateAsync()
        
        if (isUpdateNew) {
          // If there's a callback to show an alert, use it
          if (showAlert) {
            showAlert(() => void this.reloadApp())
          } else {
            // Otherwise, reload immediately
            await this.reloadApp()
          }
        }
      }
    } catch (error) {
      console.error('Error in update process:', error)
    }
  }
}

/**
 * Capacitor Storage Adapter for Supabase Auth
 * 
 * Uses @capacitor/preferences (native SharedPreferences on Android)
 * when running inside the Capacitor APK. Falls back to localStorage on web.
 * 
 * This ensures the auth session survives app restarts, force-stops,
 * and aggressive battery optimization on Android.
 */

import { isCapacitorNative } from "./capacitor-push";

let preferencesModule: typeof import("@capacitor/preferences") | null = null;

async function getPreferences() {
  if (!preferencesModule) {
    preferencesModule = await import("@capacitor/preferences");
  }
  return preferencesModule.Preferences;
}

/**
 * Custom storage implementation for Supabase auth.
 * Uses native Preferences on Capacitor, localStorage on web.
 */
export const capacitorStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isCapacitorNative()) {
      try {
        const Preferences = await getPreferences();
        const { value } = await Preferences.get({ key });
        return value;
      } catch {
        // Fallback to localStorage if native fails
        return localStorage.getItem(key);
      }
    }
    return localStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isCapacitorNative()) {
      try {
        const Preferences = await getPreferences();
        await Preferences.set({ key, value });
      } catch {
        localStorage.setItem(key, value);
      }
    } else {
      localStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (isCapacitorNative()) {
      try {
        const Preferences = await getPreferences();
        await Preferences.remove({ key });
      } catch {
        localStorage.removeItem(key);
      }
    } else {
      localStorage.removeItem(key);
    }
  },
};

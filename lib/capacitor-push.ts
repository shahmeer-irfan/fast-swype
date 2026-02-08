/**
 * Capacitor Push Notifications — Native Android only.
 * 
 * Uses @capacitor/push-notifications to register for FCM tokens
 * and handle native push notifications in the Android APK.
 * 
 * IMPORTANT: google-services.json must be placed in android/app/ for native
 * push notifications to work. Without it, FCM initialization crashes the app.
 */

import { supabase } from "./supabase/client";

/**
 * Check if we're running inside a Capacitor native app
 */
export function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

/**
 * Check if native push notifications are available (google-services.json present)
 * This does a lightweight check before attempting full registration
 */
export async function isNativePushAvailable(): Promise<boolean> {
  if (!isCapacitorNative()) return false;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    // checkPermissions() is a safe call that doesn't trigger FCM initialization
    const permStatus = await PushNotifications.checkPermissions();
    // If we get here without crashing, the plugin is available
    return permStatus.receive !== undefined;
  } catch {
    return false;
  }
}

/**
 * Register for native push notifications via Capacitor
 * Only works when running inside the Android APK with google-services.json configured
 */
export async function registerCapacitorPush(userId: string): Promise<string | null> {
  if (!isCapacitorNative()) return null;

  try {
    // First check if push is even available (won't crash)
    const available = await isNativePushAvailable();
    if (!available) {
      console.warn("Native push not available — plugin may be missing");
      return null;
    }

    const { PushNotifications } = await import("@capacitor/push-notifications");

    // Remove any previous listeners to avoid duplicates
    await PushNotifications.removeAllListeners();

    // Check permissions
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt" || permStatus.receive === "prompt-with-rationale") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      console.warn("Push notification permission denied");
      return null;
    }

    // Set up listeners BEFORE calling register() to avoid missing events
    const tokenPromise = new Promise<string | null>((resolve) => {
      // Set a timeout — if FCM fails to return a token within 15s, resolve null
      const timeout = setTimeout(() => {
        console.warn("FCM token registration timed out — is google-services.json configured?");
        resolve(null);
      }, 15000);

      PushNotifications.addListener("registration", async (token) => {
        clearTimeout(timeout);
        console.log("Native FCM token obtained");
        
        // Save token to Supabase
        try {
          await supabase
            .from("profiles")
            .update({ fcm_token: token.value })
            .eq("id", userId);
        } catch (e) {
          console.error("Error saving FCM token to Supabase:", e);
        }

        resolve(token.value);
      });

      PushNotifications.addListener("registrationError", (error) => {
        clearTimeout(timeout);
        console.error("Native push registration error:", error);
        resolve(null);
      });
    });

    // Register with native push service (FCM on Android)
    // Wrapped in try/catch — this can throw if google-services.json is misconfigured
    try {
      await PushNotifications.register();
    } catch (regError) {
      console.error("PushNotifications.register() threw:", regError);
      return null;
    }

    return await tokenPromise;
  } catch (error) {
    console.error("Capacitor push error:", error);
    return null;
  }
}

/**
 * Set up listeners for native push notifications
 */
export async function setupCapacitorPushListeners(
  onNotification?: (notification: { title: string; body: string; data?: any }) => void,
  onAction?: (data: any) => void
): Promise<void> {
  if (!isCapacitorNative()) return;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    // Notification received while app is in foreground
    await PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Push notification received:", notification);
      if (onNotification) {
        onNotification({
          title: notification.title || "FastSwype",
          body: notification.body || "You have a new notification",
          data: notification.data,
        });
      }
    });

    // Notification tapped
    await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      console.log("Push notification action:", action);
      if (onAction) {
        onAction(action.notification.data);
      }
    });
  } catch (error) {
    console.error("Error setting up Capacitor push listeners:", error);
  }
}

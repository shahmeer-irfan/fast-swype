/**
 * Capacitor Push Notifications bridge
 * 
 * When running inside a Capacitor native app, this uses the native push
 * notification system via @capacitor/push-notifications.
 * When running in a web browser, it falls back to Firebase web notifications.
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
 * Register for native push notifications via Capacitor
 * Only works when running inside the Android APK
 */
export async function registerCapacitorPush(userId: string): Promise<string | null> {
  if (!isCapacitorNative()) return null;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    // Check permissions
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt" || permStatus.receive === "prompt-with-rationale") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      console.warn("Push notification permission denied");
      return null;
    }

    // Register with native push service (FCM on Android)
    await PushNotifications.register();

    // Return a promise that resolves with the token
    return new Promise((resolve) => {
      PushNotifications.addListener("registration", async (token) => {
        console.log("Native FCM token:", token.value);
        
        // Save token to Supabase
        await supabase
          .from("profiles")
          .update({ fcm_token: token.value })
          .eq("id", userId);

        resolve(token.value);
      });

      PushNotifications.addListener("registrationError", (error) => {
        console.error("Native push registration error:", error);
        resolve(null);
      });
    });
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
    PushNotifications.addListener("pushNotificationReceived", (notification) => {
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
    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      console.log("Push notification action:", action);
      if (onAction) {
        onAction(action.notification.data);
      }
    });
  } catch (error) {
    console.error("Error setting up Capacitor push listeners:", error);
  }
}

import { getFirebaseMessaging } from "./firebase";
import { supabase } from "./supabase/client";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  // Check if notifications are supported
  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return null;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("Notification permission denied");
    return null;
  }

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    const { getToken } = await import("firebase/messaging");

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM Token obtained");
      return token;
    }

    console.warn("No FCM token returned");
    return null;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

/**
 * Save FCM token to Supabase profiles table
 */
export async function saveFCMToken(userId: string, token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ fcm_token: token })
      .eq("id", userId);

    if (error) {
      console.error("Error saving FCM token:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return false;
  }
}

/**
 * Remove FCM token from Supabase (on logout or disable)
 */
export async function removeFCMToken(userId: string): Promise<void> {
  try {
    await supabase
      .from("profiles")
      .update({ fcm_token: null })
      .eq("id", userId);
  } catch (error) {
    console.error("Error removing FCM token:", error);
  }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(
  callback: (payload: { title: string; body: string; link?: string }) => void
): (() => void) | null {
  if (typeof window === "undefined") return null;

  let unsubscribeFn: (() => void) | null = null;

  getFirebaseMessaging().then(async (messaging) => {
    if (!messaging) return;

    const { onMessage } = await import("firebase/messaging");

    unsubscribeFn = onMessage(messaging, (payload: any) => {
      console.log("Foreground message received:", payload);

      const title = payload.notification?.title || "FastSwype";
      const body = payload.notification?.body || "You have a new notification";
      const link = payload.data?.link || "/proposals";

      callback({ title, body, link });
    });
  });

  // Return cleanup function
  return () => {
    if (unsubscribeFn) unsubscribeFn();
  };
}

/**
 * Check if notifications are currently enabled
 */
export function getNotificationStatus(): "granted" | "denied" | "default" | "unsupported" {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

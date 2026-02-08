/**
 * Web Push Notifications — for PWA / browser users.
 * 
 * Uses Firebase Cloud Messaging (FCM) web SDK to:
 * 1. Register for push notifications in the browser
 * 2. Get an FCM token (saved to Supabase profiles.fcm_token)
 * 3. Listen for foreground messages
 * 
 * Background messages are handled by firebase-messaging-sw.js service worker.
 * Background messages are handled by firebase-messaging-sw.js service worker.
 */

import { getToken, onMessage, type Messaging } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";
import { supabase } from "./supabase/client";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Check if the browser supports web push notifications
 */
export function isWebPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Register for web push notifications.
 * Requests permission, registers the Firebase messaging service worker,
 * gets an FCM token, and saves it to Supabase.
 * 
 * @returns The FCM token string, or null if registration failed.
 */
export async function registerWebPush(userId: string): Promise<string | null> {
  if (!isWebPushSupported()) {
    console.warn("Web push not supported in this browser");
    return null;
  }

  if (!VAPID_KEY) {
    console.error("NEXT_PUBLIC_FIREBASE_VAPID_KEY not set — web push won't work");
    return null;
  }

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn("Firebase Messaging not supported");
      return null;
    }

    // Register the Firebase messaging service worker
    const swRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      console.warn("Failed to get FCM token");
      return null;
    }

    console.log("Web push FCM token obtained");

    // Save token to Supabase (same field as native — fcm_token)
    try {
      await supabase
        .from("profiles")
        .update({ fcm_token: token })
        .eq("id", userId);
    } catch (e) {
      console.error("Error saving web push FCM token to Supabase:", e);
    }

    return token;
  } catch (error) {
    console.error("Web push registration failed:", error);
    return null;
  }
}

/**
 * Set up listener for foreground push messages (when app is open in browser).
 * Background messages are handled by the firebase-messaging-sw.js service worker.
 */
export function setupWebPushListeners(
  onNotification?: (notification: { title: string; body: string; data?: any }) => void
): void {
  getFirebaseMessaging().then((messaging) => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log("Foreground web push message:", payload);
      if (onNotification && payload.notification) {
        onNotification({
          title: payload.notification.title || "FastSwype",
          body: payload.notification.body || "You have a new notification",
          data: payload.data,
        });
      }
    });
  });
}

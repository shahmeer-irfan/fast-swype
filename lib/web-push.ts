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
    // 1. Request notification permission FIRST (before any SW work)
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied:", permission);
      throw new Error(`Notification permission ${permission}`);
    }
    console.log("[web-push] Permission granted");

    // 2. Get Firebase Messaging instance
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      throw new Error("Firebase Messaging not supported in this browser");
    }
    console.log("[web-push] Firebase Messaging initialized");

    // 3. Register the Firebase messaging service worker
    const swRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/firebase-cloud-messaging-push-scope" }
    );
    console.log("[web-push] Service worker registered, state:",
      swRegistration.active?.state ?? swRegistration.installing?.state ?? swRegistration.waiting?.state);

    // 4. Wait for the service worker to become active
    if (!swRegistration.active) {
      await new Promise<void>((resolve, reject) => {
        const sw = swRegistration.installing || swRegistration.waiting;
        if (!sw) { reject(new Error("No service worker installing/waiting")); return; }
        sw.addEventListener("statechange", () => {
          if (sw.state === "activated") resolve();
          if (sw.state === "redundant") reject(new Error("Service worker became redundant"));
        });
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error("Service worker activation timed out")), 10000);
      });
      console.log("[web-push] Service worker now active");
    }

    // 5. Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      throw new Error("getToken returned empty — check VAPID key and Firebase config");
    }

    console.log("[web-push] FCM token obtained:", token.substring(0, 20) + "...");

    // 6. Save token to Supabase
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ fcm_token: token })
      .eq("id", userId);

    if (dbError) {
      console.error("[web-push] Supabase save error:", dbError);
      throw new Error(`Failed to save token: ${dbError.message}`);
    }

    console.log("[web-push] Token saved to Supabase successfully");
    return token;
  } catch (error: any) {
    console.error("[web-push] Registration failed:", error);
    throw error; // Re-throw so NotificationHandler can show the error
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
      if (onNotification) {
        // Support both notification payload and data-only payload
        const title = payload.notification?.title || payload.data?.title || "FastSwype";
        const body = payload.notification?.body || payload.data?.body || "You have a new notification";
        onNotification({
          title,
          body,
          data: payload.data,
        });
      }
    });
  });
}

/**
 * Web Push Notifications — for PWA / browser users.
 * 
 * Uses Firebase Cloud Messaging (FCM) web SDK to:
 * 1. Register for push notifications in the browser
 * 2. Get an FCM token (saved to Supabase profiles.fcm_token)
 * 3. Listen for foreground messages
 * 
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
 * Get or reuse the Firebase messaging service worker registration.
 * Avoids re-registering on every call, which causes "redundant" state on Android.
 */
async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration> {
  // First, check if we already have a firebase-messaging-sw.js registered
  const existingRegistrations = await navigator.serviceWorker.getRegistrations();
  const existing = existingRegistrations.find(
    (reg) => reg.active?.scriptURL?.includes("firebase-messaging-sw.js")
  );
  if (existing) {
    console.log("[web-push] Reusing existing Firebase SW registration");
    return existing;
  }

  // Register fresh — use scope "/" so it doesn't conflict with the Workbox SW
  // scope. Firebase needs the SW to intercept push events at the root scope.
  console.log("[web-push] Registering new Firebase SW...");
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { scope: "/firebase-cloud-messaging-push-scope" }
  );

  // Wait for it to become active (with generous timeout for Android)
  if (!registration.active) {
    await new Promise<void>((resolve, reject) => {
      const sw = registration.installing || registration.waiting;
      if (!sw) {
        reject(new Error("No service worker installing/waiting"));
        return;
      }

      const onStateChange = () => {
        if (sw.state === "activated") {
          sw.removeEventListener("statechange", onStateChange);
          resolve();
        }
        if (sw.state === "redundant") {
          sw.removeEventListener("statechange", onStateChange);
          reject(new Error("Service worker became redundant"));
        }
      };
      sw.addEventListener("statechange", onStateChange);

      // 30-second timeout for slow Android devices
      setTimeout(() => {
        sw.removeEventListener("statechange", onStateChange);
        // If the SW is activated by now, resolve anyway
        if (registration.active) {
          resolve();
        } else {
          reject(new Error("Service worker activation timed out"));
        }
      }, 30000);
    });
  }

  console.log("[web-push] Firebase SW active");
  return registration;
}

/**
 * Attempt to get FCM token with retry logic.
 * Firebase's getToken() can fail with AbortError on Android due to slow
 * push subscription. We retry with exponential backoff.
 */
async function getTokenWithRetry(
  messaging: Messaging,
  swRegistration: ServiceWorkerRegistration,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[web-push] getToken attempt ${attempt}/${maxRetries}...`);

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY!,
        serviceWorkerRegistration: swRegistration,
      });

      if (!token) {
        throw new Error("getToken returned empty — check VAPID key and Firebase config");
      }

      console.log("[web-push] FCM token obtained:", token.substring(0, 20) + "...");
      return token;
    } catch (error: any) {
      lastError = error;
      const isAbortError =
        error?.name === "AbortError" ||
        error?.message?.includes("abort") ||
        error?.message?.includes("Abort") ||
        error?.code === 20;

      console.warn(
        `[web-push] getToken attempt ${attempt} failed:`,
        isAbortError ? "AbortError (Android push subscription slow)" : error?.message
      );

      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[web-push] Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error("getToken failed after all retries");
}

/**
 * Save FCM token to Supabase profiles table.
 * Retries on failure to ensure the token is persisted.
 */
async function saveTokenToSupabase(userId: string, token: string): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ fcm_token: token })
        .eq("id", userId);

      if (dbError) {
        throw new Error(dbError.message);
      }

      console.log("[web-push] Token saved to Supabase successfully");
      return;
    } catch (err: any) {
      console.error(`[web-push] Save attempt ${attempt} failed:`, err?.message);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      } else {
        throw new Error(`Failed to save token after 3 attempts: ${err?.message}`);
      }
    }
  }
}

/**
 * Register for web push notifications.
 * Requests permission, registers the Firebase messaging service worker,
 * gets an FCM token, and saves it to Supabase.
 * 
 * Handles Android-specific issues:
 * - AbortError from slow push subscription (retries with backoff)
 * - Service worker conflicts (reuses existing registrations)
 * - Slow SW activation (30s timeout instead of 10s)
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

    // 3. Get or reuse the Firebase messaging service worker (don't re-register)
    const swRegistration = await getOrRegisterServiceWorker();

    // 4. Get FCM token with retry logic for Android AbortError
    const token = await getTokenWithRetry(messaging, swRegistration);

    // 5. Save token to Supabase with retry
    await saveTokenToSupabase(userId, token);

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

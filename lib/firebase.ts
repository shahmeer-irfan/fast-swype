/**
 * Firebase Web SDK initialization for web push notifications (PWA).
 * This is used for web/PWA push notifications only.
 * Background push is handled by public/firebase-messaging-sw.js service worker.
 */

import { initializeApp, getApps } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCb25-nOSYJeARCWarcxGy8V6j-iOVxxlc",
  authDomain: "fastswype.firebaseapp.com",
  projectId: "fastswype",
  storageBucket: "fastswype.firebasestorage.app",
  messagingSenderId: "383629469179",
  appId: "1:383629469179:web:3896da73157818fe45175e",
  measurementId: "G-EQ8CQHBS77",
};

// Initialize Firebase app (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Get Firebase Messaging instance (only if supported by browser).
 * Returns null on unsupported browsers or server-side.
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;

  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
}

export { app };

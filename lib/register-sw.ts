/**
 * Register the Firebase Messaging service worker with config injected
 */
export async function registerFirebaseSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    // Check if already registered
    const existingReg = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
    if (existingReg) {
      return existingReg;
    }

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });

    console.log("Firebase SW registered:", registration.scope);
    return registration;
  } catch (error) {
    console.error("Firebase SW registration failed:", error);
    return null;
  }
}

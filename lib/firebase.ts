let app: any = null;
let messaging: any = null;

async function initFirebase() {
  if (app) return app;
  const { initializeApp, getApps } = await import("firebase/app");
  
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  return app;
}

export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;

  const { isSupported, getMessaging } = await import("firebase/messaging");
  
  const supported = await isSupported();
  if (!supported) {
    console.warn("Firebase Messaging is not supported in this browser");
    return null;
  }

  if (!messaging) {
    const fbApp = await initFirebase();
    messaging = getMessaging(fbApp);
  }
  return messaging;
}

export { initFirebase };

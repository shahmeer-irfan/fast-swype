/**
 * Firebase Cloud Messaging Service Worker for Web Push Notifications.
 * 
 * This service worker runs in the background and handles push messages
 * when the web app/PWA is not in the foreground. It shows notifications
 * in the Android notification shade (or desktop notification center).
 * 
 * For PWA users who "Add to Home Screen", this keeps working even when
 * the browser is closed — just like a native app.
 */

/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCb25-nOSYJeARCWarcxGy8V6j-iOVxxlc",
  authDomain: "fastswype.firebaseapp.com",
  projectId: "fastswype",
  storageBucket: "fastswype.firebasestorage.app",
  messagingSenderId: "383629469179",
  appId: "1:383629469179:web:3896da73157818fe45175e",
});

const messaging = firebase.messaging();

// Handle background push messages (when app is not in foreground)
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received:", payload);

  // If the push already has a notification field (webpush.notification),
  // the browser will display it automatically. Only show manually for
  // data-only messages to avoid duplicates.
  if (payload.notification) {
    // Browser auto-displays this — skip manual showNotification
    return;
  }

  const notificationTitle = payload.data?.title || "FastSwype";
  const notificationBody = payload.data?.body || "You have a new notification";
  const link = payload.data?.link || "/proposals";
  const tag = payload.data?.tag || "fastswype";
  const icon = payload.data?.icon || "/icons/icon-192x192.png";
  const badge = payload.data?.badge || "/icons/icon-72x72.png";

  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: icon,
    badge: badge,
    tag: tag,
    data: { link },
    vibrate: [200, 100, 200],
    requireInteraction: true,
  });
});

// Handle notification click — open the relevant page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const link = event.notification.data?.link || "/proposals";
  const urlToOpen = new URL(link, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(urlToOpen);
    })
  );
});

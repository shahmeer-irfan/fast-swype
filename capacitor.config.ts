import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fastswype.app",
  appName: "FastSwype",
  // Point to the live Vercel URL — no static export needed
  // App auto-updates when you deploy to Vercel
  server: {
    url: "https://fast-swype.vercel.app",
    cleartext: true,
  },
  // Minimal webDir required by Capacitor (won't actually be used since we have server.url)
  webDir: "out",
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;

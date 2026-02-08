import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Don't cache Firebase messaging service worker
  publicExcludes: ["!firebase-messaging-sw.js"],
});

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    styledComponents: true,
  },
  // Required for next-pwa webpack plugin compatibility with Next.js 16 Turbopack
  turbopack: {},
};

export default withPWA(nextConfig);

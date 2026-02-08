declare module "@ducanh2912/next-pwa" {
  import type { NextConfig } from "next";

  interface PWAConfig {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    publicExcludes?: string[];
    buildExcludes?: (string | RegExp)[];
    scope?: string;
    sw?: string;
    runtimeCaching?: any[];
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
  }

  export default function withPWAInit(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}

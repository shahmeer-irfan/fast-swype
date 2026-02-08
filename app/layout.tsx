import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import StyledComponentsRegistry from "@/lib/registry";
import { Analytics } from "@vercel/analytics/react";
import NotificationHandler from "@/components/NotificationHandler";
import PWAUpdater from "@/components/PWAUpdater";

export const metadata: Metadata = {
  title: "FastSwype — Find Your FYP Partner | FAST Students",
  description: "Swipe to find the perfect Final Year Project partner at FAST. Completely free, unlimited proposals, no AI BS. Built for FAST students only.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FastSwype",
  },
};

export const viewport: Viewport = {
  themeColor: "#4387f4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Changa+One:ital@0;1&family=Lexend+Deca:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <StyledComponentsRegistry>
          <AuthProvider>
            <NotificationHandler />
            <PWAUpdater />
            {children}
          </AuthProvider>
        </StyledComponentsRegistry>
        <Analytics />
      </body>
    </html>
  );
}

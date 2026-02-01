import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import StyledComponentsRegistry from "@/lib/registry";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "FastSwype - Find Your FYP Partner for Just 250 PKR",
  description: "Swipe to find the perfect Final Year Project partner at FAST. Get 2 FREE proposals, then unlock unlimited for just PKR 250 (~$1)!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Changa+One:ital@0;1&family=Lexend+Deca:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <StyledComponentsRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </StyledComponentsRegistry>
        <Analytics />
      </body>
    </html>
  );
}

/**
 * Platform detection utilities
 */

export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isMobile(): boolean {
  return isAndroid() || isIOS();
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  // Check if running as installed PWA
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

export function isPWAInstallable(): boolean {
  if (typeof window === "undefined") return false;
  // PWA can be installed on Android Chrome or desktop browsers
  return isAndroid() || (!isIOS() && "serviceWorker" in navigator);
}

export function getBrowserName(): string {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "unknown";
}

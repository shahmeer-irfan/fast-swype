"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

/**
 * Detects when a new version of the PWA is available (after Vercel deploy)
 * and prompts the user to refresh. Also auto-checks periodically.
 */
export default function PWAUpdater() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null | undefined = null;

    const checkForUpdate = async () => {
      try {
        registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      } catch (err) {
        console.error("SW update check failed:", err);
      }
    };

    const handleControllerChange = () => {
      // New service worker took control — reload to get latest version
      if (updating) {
        window.location.reload();
      }
    };

    const handleSWStateChange = (sw: ServiceWorker) => {
      sw.addEventListener("statechange", () => {
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          // New version installed, waiting to activate
          setShowUpdate(true);
        }
      });
    };

    // Listen for new service worker
    navigator.serviceWorker.ready.then((reg) => {
      registration = reg;

      // Check if there's already a waiting worker
      if (reg.waiting) {
        setShowUpdate(true);
      }

      // Listen for new installing workers
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          handleSWStateChange(newWorker);
        }
      });
    });

    // When the new SW takes control, reload
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    // Check for updates every 5 minutes
    const interval = setInterval(checkForUpdate, 5 * 60 * 1000);

    // Also check when the app comes back to foreground
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkForUpdate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, [updating]);

  const handleUpdate = async () => {
    setUpdating(true);
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      // Tell the waiting worker to skip waiting and take over
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  if (!showUpdate) return null;

  return (
    <StyledBanner>
      <div className="update-banner">
        <div className="update-content">
          <span className="update-icon">🚀</span>
          <span className="update-text">
            {updating ? "UPDATING..." : "NEW VERSION AVAILABLE!"}
          </span>
        </div>
        {!updating && (
          <button className="update-button" onClick={handleUpdate}>
            UPDATE NOW
          </button>
        )}
      </div>
    </StyledBanner>
  );
}

const StyledBanner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10002;
  padding: 0 12px 12px;
  animation: slideUp 0.4s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .update-banner {
    max-width: 500px;
    margin: 0 auto;
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #2c5aa0;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .update-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .update-icon {
    font-size: 20px;
  }

  .update-text {
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    letter-spacing: 0.5px;
  }

  .update-button {
    background: #fff;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #000;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    color: #000;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .update-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #000;
  }

  .update-button:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }
`;

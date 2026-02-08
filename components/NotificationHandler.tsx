"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useAuth } from "@/lib/auth-context";
import {
  requestNotificationPermission,
  saveFCMToken,
  onForegroundMessage,
  getNotificationStatus,
} from "@/lib/notifications";
import {
  isCapacitorNative,
  registerCapacitorPush,
  setupCapacitorPushListeners,
} from "@/lib/capacitor-push";

export default function NotificationHandler() {
  const { user } = useAuth();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const [toast, setToast] = useState<{ title: string; body: string; link?: string } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");

  // Check permission status on mount
  useEffect(() => {
    const status = getNotificationStatus();
    setPermissionStatus(status);

    // If running in Capacitor native app, auto-register push
    if (user && isCapacitorNative()) {
      registerCapacitorPush(user.id).then((token) => {
        if (token) setPermissionStatus("granted");
      });
      setupCapacitorPushListeners(
        // On foreground notification
        (notification) => {
          setToast({
            title: notification.title,
            body: notification.body,
            link: notification.data?.link || "/proposals",
          });
          setTimeout(() => setToast(null), 5000);
        },
        // On notification tapped
        (data) => {
          if (data?.link) router.push(data.link);
        }
      );
      return; // Skip web notification flow
    }

    // Web flow: Show prompt if user is logged in and hasn't decided yet
    if (user && status === "default") {
      // Delay prompt by 3 seconds for better UX
      const timer = setTimeout(() => {
        // Only show if not dismissed before in this session
        const dismissed = sessionStorage.getItem("notification_prompt_dismissed");
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Auto-register token if permission already granted (web only)
  useEffect(() => {
    if (user && permissionStatus === "granted" && !isCapacitorNative()) {
      registerToken();
    }
  }, [user, permissionStatus]);

  // Listen for foreground messages (web only — Capacitor uses native listeners above)
  useEffect(() => {
    if (!user || isCapacitorNative()) return;

    const cleanup = onForegroundMessage((payload) => {
      setToast(payload);
      // Auto-hide after 5 seconds
      setTimeout(() => setToast(null), 5000);
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [user]);

  const registerToken = useCallback(async () => {
    if (!user) return;

    const token = await requestNotificationPermission();
    if (token) {
      await saveFCMToken(user.id, token);
      setPermissionStatus("granted");
    }
  }, [user]);

  const handleEnable = async () => {
    setShowPrompt(false);
    await registerToken();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("notification_prompt_dismissed", "true");
  };

  const handleToastClick = () => {
    if (toast?.link) {
      router.push(toast.link);
    }
    setToast(null);
  };

  return (
    <>
      {/* Permission Prompt */}
      {showPrompt && (
        <StyledPrompt>
          <div className="prompt-card">
            <div className="prompt-icon">🔔</div>
            <div className="prompt-content">
              <h3 className="prompt-title">STAY IN THE LOOP</h3>
              <p className="prompt-text">
                Get notified when someone sends you a proposal or accepts yours!
              </p>
            </div>
            <div className="prompt-actions">
              <button className="prompt-enable" onClick={handleEnable}>
                ENABLE
              </button>
              <button className="prompt-dismiss" onClick={handleDismiss}>
                LATER
              </button>
            </div>
          </div>
        </StyledPrompt>
      )}

      {/* Foreground Toast */}
      {toast && (
        <StyledToast onClick={handleToastClick}>
          <div className="toast-card">
            <div className="toast-icon">🔔</div>
            <div className="toast-content">
              <strong className="toast-title">{toast.title}</strong>
              <p className="toast-body">{toast.body}</p>
            </div>
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); setToast(null); }}>
              ✕
            </button>
          </div>
        </StyledToast>
      )}
    </>
  );
}

const StyledPrompt = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  width: calc(100% - 40px);
  max-width: 420px;
  animation: slideUp 0.4s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .prompt-card {
    background: #2d2d2d;
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #4387f4;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .prompt-icon {
    font-size: 28px;
  }

  .prompt-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .prompt-title {
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    color: #4387f4;
    letter-spacing: 1px;
    margin: 0;
  }

  .prompt-text {
    font-size: 13px;
    color: #ccc;
    margin: 0;
    line-height: 1.4;
  }

  .prompt-actions {
    display: flex;
    gap: 10px;
  }

  .prompt-enable {
    flex: 1;
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #2c5aa0;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .prompt-enable:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #2c5aa0;
  }

  .prompt-enable:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }

  .prompt-dismiss {
    background: #1a1a1a;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #333;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    color: #999;
    cursor: pointer;
    transition: all 0.2s;
  }

  .prompt-dismiss:hover {
    color: #fff;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #333;
  }

  .prompt-dismiss:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }
`;

const StyledToast = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  width: calc(100% - 40px);
  max-width: 420px;
  cursor: pointer;
  animation: slideDown 0.4s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .toast-card {
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #2c5aa0;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toast-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .toast-content {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    display: block;
  }

  .toast-body {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    margin: 2px 0 0;
    line-height: 1.3;
  }

  .toast-close {
    background: none;
    border: none;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    flex-shrink: 0;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .toast-close:hover {
    opacity: 1;
  }
`;

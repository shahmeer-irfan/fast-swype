"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useAuth } from "@/lib/auth-context";
import {
  isWebPushSupported,
  registerWebPush,
  setupWebPushListeners,
} from "@/lib/web-push";

/**
 * NotificationHandler — Web push notifications via Firebase Cloud Messaging.
 * 
 * Uses FCM web SDK + service worker. When the PWA is installed
 * (Add to Home Screen), notifications appear in the Android notification shade
 * even when the browser is closed, just like a native app.
 */
export default function NotificationHandler() {
  const { user } = useAuth();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const [toast, setToast] = useState<{ title: string; body: string; link?: string } | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isWebPushSupported());
  }, []);

  useEffect(() => {
    if (!user || !supported) return;

    const showToastNotification = (notification: { title: string; body: string; data?: any }) => {
      setToast({
        title: notification.title,
        body: notification.body,
        link: notification.data?.link || "/proposals",
      });
      setTimeout(() => setToast(null), 5000);
    };

    // Check if user already has a token (previously enabled notifications)
    const checkExistingToken = async () => {
      try {
        const { data } = await (await import("@/lib/supabase/client")).supabase
          .from("profiles")
          .select("fcm_token")
          .eq("id", user.id)
          .single();

        if (data?.fcm_token) {
          // Already registered — set up foreground listeners
          setupWebPushListeners(showToastNotification);
        } else {
          // No token yet — show prompt so user can opt-in
          const dismissed = sessionStorage.getItem("notification_prompt_dismissed");
          if (!dismissed) {
            setTimeout(() => setShowPrompt(true), 3000);
          }
        }
      } catch {
        // Show prompt as fallback
        const dismissed = sessionStorage.getItem("notification_prompt_dismissed");
        if (!dismissed) {
          setTimeout(() => setShowPrompt(true), 3000);
        }
      }
    };
    checkExistingToken();
  }, [user, supported]);

  // Nothing to render on unsupported browsers
  if (!supported) return null;

  const handleEnable = async () => {
    setShowPrompt(false);
    if (!user) return;

    try {
      const token = await registerWebPush(user.id);
      if (token) {
        setupWebPushListeners((notification) => {
          setToast({
            title: notification.title,
            body: notification.body,
            link: notification.data?.link || "/proposals",
          });
          setTimeout(() => setToast(null), 5000);
        });
      } else {
        console.warn("Failed to get push notification token");
      }
    } catch (error) {
      console.error("Failed to register push:", error);
    }
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

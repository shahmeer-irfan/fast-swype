"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { isAndroid, isIOS, isStandalone } from "@/lib/platform";

const APK_URL = "/fastswype.apk";

export default function DownloadApp() {
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop" | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setIsInstalled(true);
    }

    if (isAndroid()) {
      setPlatform("android");
    } else if (isIOS()) {
      setPlatform("ios");
    } else {
      setPlatform("desktop");
    }
  }, []);

  const handleDownloadAPK = () => {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = APK_URL;
    link.download = "FastSwype.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 3000);
  };

  if (isInstalled) {
    return (
      <StyledWrapper>
        <div className="download-card installed">
          <div className="card-icon">✅</div>
          <h3 className="card-title">APP INSTALLED</h3>
          <p className="card-text">FastSwype is installed on your device! You&apos;re all set.</p>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      {/* Android — APK Download */}
      {platform === "android" && (
        <div className="download-card">
          <div className="card-header">
            <div className="card-icon">📱</div>
            <div>
              <h3 className="card-title">DOWNLOAD FASTSWYPE</h3>
              <p className="card-subtitle">Android App</p>
            </div>
          </div>

          <p className="card-text">
            Get the full Android app experience with push notifications. 
            The app auto-updates whenever we push new features!
          </p>

          <button 
            className="download-button" 
            onClick={handleDownloadAPK}
            disabled={downloading}
          >
            {downloading ? (
              <>⏳ DOWNLOADING...</>
            ) : (
              <>⬇️ DOWNLOAD APK</>
            )}
          </button>

          <div className="install-steps">
            <h4>AFTER DOWNLOADING:</h4>
            <ol>
              <li>Open the downloaded <strong>FastSwype.apk</strong> file</li>
              <li>If prompted, tap <strong>&quot;Install anyway&quot;</strong> or enable <strong>&quot;Install from unknown sources&quot;</strong></li>
              <li>Tap <strong>&quot;Install&quot;</strong> and wait</li>
              <li>Open FastSwype from your home screen! 🎉</li>
            </ol>
          </div>

          <div className="info-badge">
            <span>🔄</span>
            <span>App updates automatically when we deploy changes — no need to re-download!</span>
          </div>
        </div>
      )}

      {/* iOS — Website Only */}
      {platform === "ios" && (
        <div className="download-card">
          <div className="card-header">
            <div className="card-icon">🍎</div>
            <div>
              <h3 className="card-title">iOS NOT SUPPORTED YET</h3>
              <p className="card-subtitle">Use the website instead</p>
            </div>
          </div>

          <p className="card-text">
            FastSwype is currently available as an Android app only. 
            On iPhone, you can use the website at full speed — it works great on Safari!
          </p>

          <div className="install-steps">
            <h4>ADD TO HOME SCREEN (OPTIONAL):</h4>
            <ol>
              <li>Open <strong>fastswype.vercel.app</strong> in Safari</li>
              <li>Tap the <strong>Share button</strong> (box with arrow)</li>
              <li>Tap <strong>&quot;Add to Home Screen&quot;</strong></li>
              <li>Tap <strong>&quot;Add&quot;</strong></li>
            </ol>
          </div>
        </div>
      )}

      {/* Desktop — Redirect to phone */}
      {platform === "desktop" && (
        <div className="download-card">
          <div className="card-header">
            <div className="card-icon">💻</div>
            <div>
              <h3 className="card-title">ANDROID APP ONLY</h3>
              <p className="card-subtitle">Open this page on your phone</p>
            </div>
          </div>

          <p className="card-text">
            FastSwype is available as an Android app. Open this page on your Android phone to download.
          </p>

          <div className="qr-hint">
            <span className="qr-icon">📲</span>
            <span>Visit <strong>fastswype.vercel.app/download</strong> on your Android phone</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {platform === null && (
        <div className="download-card">
          <div className="card-icon">⏳</div>
          <h3 className="card-title">DETECTING DEVICE...</h3>
        </div>
      )}
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .download-card {
    background: #2d2d2d;
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #4387f4;
    padding: 28px;
    max-width: 440px;
    width: 100%;
    margin: 0 auto;
  }

  .download-card.installed {
    box-shadow: 6px 6px 0 #22c55e;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  .card-icon {
    font-size: 36px;
    flex-shrink: 0;
  }

  .card-title {
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    color: #4387f4;
    letter-spacing: 1px;
    margin: 0;
  }

  .card-subtitle {
    font-size: 12px;
    color: #888;
    margin: 2px 0 0;
    text-transform: uppercase;
    font-weight: 700;
  }

  .card-text {
    font-size: 14px;
    color: #ccc;
    line-height: 1.6;
    margin: 0 0 20px;
  }

  .download-button {
    width: 100%;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s;
    border: 3px solid #000;
    background: #22c55e;
    color: #fff;
    box-shadow: 5px 5px 0 #15803d;
    margin-bottom: 20px;
  }

  .download-button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0 #15803d;
  }

  .download-button:active:not(:disabled) {
    transform: translate(5px, 5px);
    box-shadow: none;
  }

  .download-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .install-steps {
    background: #1a1a1a;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #4387f4;
    padding: 18px;
    margin-bottom: 16px;

    h4 {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      color: #4387f4;
      letter-spacing: 1px;
      margin: 0 0 12px;
    }

    ol {
      margin: 0;
      padding-left: 20px;
      color: #ccc;
      font-size: 13px;
      line-height: 2;

      strong {
        color: #fff;
      }
    }
  }

  .info-badge {
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #2c5aa0;
    padding: 12px 16px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
    line-height: 1.4;
  }

  .qr-hint {
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #2c5aa0;
    padding: 16px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 12px;
    line-height: 1.4;

    strong {
      text-decoration: underline;
    }
  }

  .qr-icon {
    font-size: 28px;
    flex-shrink: 0;
  }
`;

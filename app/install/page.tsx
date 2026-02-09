"use client";

import { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import BrutalistPattern from "@/components/BrutalistPattern";

export default function InstallPage() {
  const [platform, setPlatform] = useState<"ios" | "android">("android");

  return (
    <StyledWrapper>
      <BrutalistPattern />
      
      <div className="install-container">
        <Link href="/">
          <button className="back-button">← Back to Home</button>
        </Link>

        <div className="header">
          <h1 className="title">Install FastSwype</h1>
          <p className="subtitle">Add to your home screen in under 30 seconds</p>
        </div>

        {/* Platform Toggle */}
        <div className="platform-toggle">
          <button
            className={`toggle-btn ${platform === "android" ? "active" : ""}`}
            onClick={() => setPlatform("android")}
          >
            🤖 Android
          </button>
          <button
            className={`toggle-btn ${platform === "ios" ? "active" : ""}`}
            onClick={() => setPlatform("ios")}
          >
            🍎 iPhone
          </button>
        </div>

        {/* Android Instructions */}
        {platform === "android" && (
          <div className="instructions android-instructions">
            <div className="platform-badge android">ANDROID (CHROME)</div>
            
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Open Chrome browser</h3>
                <p>Make sure you're viewing this site in <strong>Google Chrome</strong></p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Tap the menu (⋮)</h3>
                <p>Tap the <strong>3 dots</strong> in the top-right corner</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Tap "Install app" or "Add to Home screen"</h3>
                <p>Chrome will show an install prompt</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Tap "Install"</h3>
                <p>FastSwype icon appears on your home screen</p>
              </div>
            </div>

            <div className="success-box">
              <div className="success-icon">✅</div>
              <div>
                <h4>You're done!</h4>
                <p>Open FastSwype from your home screen. It works offline and sends push notifications just like a native app.</p>
              </div>
            </div>
          </div>
        )}

        {/* iOS Instructions */}
        {platform === "ios" && (
          <div className="instructions ios-instructions">
            <div className="platform-badge ios">iPHONE (SAFARI)</div>
            
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Open Safari browser</h3>
                <p>iOS requires <strong>Safari</strong> to install web apps (Chrome won't work)</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Tap the Share button</h3>
                <p>Tap the <strong>Share icon</strong> at the bottom (box with arrow ↑)</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Scroll down and tap "Add to Home Screen"</h3>
                <p>You'll see the FastSwype icon preview</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Tap "Add" in the top-right</h3>
                <p>FastSwype icon appears on your home screen</p>
              </div>
            </div>

            <div className="success-box">
              <div className="success-icon">✅</div>
              <div>
                <h4>You're done!</h4>
                <p>Open FastSwype from your home screen. Push notifications require iOS 16.4+ and will prompt you after installation.</p>
              </div>
            </div>

            <div className="ios-note">
              <strong>Note:</strong> Push notifications on iOS only work when the app is installed via "Add to Home Screen" — not from in-browser Safari.
            </div>
          </div>
        )}

        <div className="cta-section">
          <Link href="/login">
            <button className="cta-button">
              Continue to FastSwype →
            </button>
          </Link>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  padding: 40px 20px;
  position: relative;

  .install-container {
    max-width: 680px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .back-button {
    background: #2d2d2d;
    color: #fff;
    border: 2px solid #4387f4;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 30px;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .back-button:hover {
    background: #333;
    transform: translateX(-3px);
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
  }

  .title {
    font-size: 56px;
    font-weight: 900;
    letter-spacing: -2px;
    color: #ffffff;
    margin-bottom: 12px;
    line-height: 1;
  }

  .subtitle {
    font-size: 18px;
    color: #999;
    font-weight: 600;
  }

  /* Platform Toggle */
  .platform-toggle {
    display: flex;
    gap: 12px;
    margin-bottom: 40px;
    background: #2d2d2d;
    padding: 8px;
    border: 3px solid #000;
  }

  .toggle-btn {
    flex: 1;
    padding: 14px 24px;
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
    background: transparent;
    color: #999;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.5px;
  }

  .toggle-btn:hover {
    color: #fff;
  }

  .toggle-btn.active {
    background: #4387f4;
    color: #fff;
    border-color: #000;
    box-shadow: 4px 4px 0 #2c5aa0;
  }

  /* Instructions */
  .instructions {
    background: #2d2d2d;
    border: 3px solid #000;
    padding: 32px;
    box-shadow: 8px 8px 0 #333;
  }

  .platform-badge {
    display: inline-block;
    padding: 8px 18px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    border: 2px solid #000;
    margin-bottom: 28px;
  }

  .platform-badge.android {
    background: #10b981;
    color: #fff;
  }

  .platform-badge.ios {
    background: #fff;
    color: #000;
  }

  /* Steps */
  .step {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 2px solid #333;
  }

  .step:last-of-type {
    border-bottom: none;
  }

  .step-number {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    background: #4387f4;
    color: #fff;
    font-size: 24px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
  }

  .step-content h3 {
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 6px;
    line-height: 1.2;
  }

  .step-content p {
    font-size: 14px;
    color: #aaa;
    line-height: 1.5;
    margin: 0;
  }

  .step-content strong {
    color: #fff;
    font-weight: 700;
  }

  /* Success Box */
  .success-box {
    display: flex;
    gap: 16px;
    background: #1a1a1a;
    border: 2px solid #10b981;
    padding: 20px;
    margin-top: 28px;
  }

  .success-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .success-box h4 {
    font-size: 16px;
    font-weight: 800;
    color: #10b981;
    margin-bottom: 6px;
  }

  .success-box p {
    font-size: 14px;
    color: #999;
    line-height: 1.5;
    margin: 0;
  }

  /* Alternative / Notes */
  .alternative,
  .ios-note {
    margin-top: 24px;
    padding: 16px;
    background: #1a1a1a;
    border-left: 4px solid #4387f4;
  }

  .alternative h4 {
    font-size: 14px;
    font-weight: 800;
    color: #4387f4;
    margin-bottom: 6px;
  }

  .alternative p,
  .ios-note {
    font-size: 13px;
    color: #aaa;
    line-height: 1.5;
    margin: 0;
  }

  .alternative a {
    color: #4387f4;
    text-decoration: underline;
    font-weight: 700;
  }

  .alternative a:hover {
    color: #5a9aff;
  }

  .ios-note {
    border-left-color: #ff9500;
  }

  .ios-note strong {
    color: #ff9500;
    font-weight: 800;
  }

  /* CTA */
  .cta-section {
    margin-top: 40px;
    text-align: center;
  }

  .cta-button {
    padding: 18px 40px;
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    background: #4387f4;
    color: #fff;
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #2c5aa0;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: -0.5px;
  }

  .cta-button:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #2c5aa0;
  }

  .cta-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    padding: 24px 16px;

    .title {
      font-size: 40px;
    }

    .subtitle {
      font-size: 16px;
    }

    .instructions {
      padding: 24px 16px;
    }

    .step {
      flex-direction: column;
      gap: 12px;
    }

    .step-number {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }

    .toggle-btn {
      padding: 12px 16px;
      font-size: 14px;
    }
  }
`;

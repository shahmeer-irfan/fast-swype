"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import BrutalistPattern from "@/components/BrutalistPattern";
import { useClickSound } from "@/hooks/useClickSound";

export default function Home() {
  const { playConfirm, playHover, playClick } = useClickSound();
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      playConfirm();
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === "accepted") {
        setInstallPrompt(null);
      }
    }
  };

  return (
    <StyledWrapper>
      <BrutalistPattern />

      {/* ═══════════════ SECTION 1: HERO ═══════════════ */}
      <section className="hero-section">
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <span className="badge-dot" />
            FAST STUDENTS ONLY
          </div>

          {/* Brand */}
          <h1 className="hero-title">
            Fast<span className="highlight">Swype</span>
          </h1>
          <p className="hero-tagline">
            No more WhatsApp group chaos.<br />
            <span className="tagline-emphasis">Match. Partner. Build.</span>
          </p>

          {/* Stats bar */}
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">FREE</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">PROPOSALS</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">🔔</span>
              <span className="stat-label">PUSH NOTIFS</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="cta-group">
            <Link href="/login">
              <button
                className="cta-primary"
                onClick={playConfirm}
                onMouseEnter={playHover}
              >
                Continue on Web →
              </button>
            </Link>
            <Link href="/install">
              <button
                className="cta-secondary"
                onClick={playClick}
                onMouseEnter={playHover}
              >
                📲 Install App
              </button>
            </Link>
          </div>


        </div>
      </section>

      {/* ═══════════════ SECTION 2: HOW IT WORKS ═══════════════ */}
      <section className="content-section">
        <div className="section-inner">
          <div className="section-badge">THE REAL DEAL</div>
          <h2 className="section-title">
            Add to home screen.<br />Works like a native app.
          </h2>
          <div className="roast-grid">
            <div className="roast-card" onMouseEnter={playHover}>
              <div className="roast-icon">📱</div>
              <h3>Install Anywhere</h3>
              <p>iPhone or Android. <strong>No app store. No download.</strong> Just add to home screen and you're set.</p>
            </div>
            <div className="roast-card" onMouseEnter={playHover}>
              <div className="roast-icon">⚡</div>
              <h3>Setup in seconds</h3>
              <p><strong>Skills. Domain. Done.</strong> Start matching in under 2 minutes.</p>
            </div>
            <div className="roast-card" onMouseEnter={playHover}>
              <div className="roast-icon">🔔</div>
              <h3>Get Notified</h3>
              <p><strong>Real-time alerts</strong> when someone wants to team up. Even when your phone's locked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 3: 3 STEPS ═══════════════ */}
      <section className="content-section">
        <div className="section-inner">
          <div className="section-badge">3 STEPS</div>
          <h2 className="section-title">How it works</h2>
          <div className="steps-container">
            <div className="step" onMouseEnter={playHover}>
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Set up profile</h3>
                <p>Add skills, pick domain, specify what you need.</p>
              </div>
            </div>
            <div className="step-connector" />
            <div className="step" onMouseEnter={playHover}>
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Browse partners</h3>
                <p>See skills, domain, campus. Pass or propose.</p>
              </div>
            </div>
            <div className="step-connector" />
            <div className="step" onMouseEnter={playHover}>
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Team up</h3>
                <p>They accept? You both get contact info. Go build.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 4: FEATURES ═══════════════ */}
      <section className="content-section features-section">
        <div className="section-inner">
          <div className="section-badge">WHAT YOU GET</div>
          <h2 className="section-title">Everything. For free.</h2>
          <div className="features-grid">
            <div className="feature-card" onMouseEnter={playHover}>
              <span className="feature-icon">🏫</span>
              <h3>Campus Filters</h3>
              <p>ISB, LHR, KHI, PWR — pick your city</p>
            </div>
            <div className="feature-card" onMouseEnter={playHover}>
              <span className="feature-icon">🔔</span>
              <h3>Push Alerts</h3>
              <p>Get pinged when someone proposes or accepts</p>
            </div>
            <div className="feature-card" onMouseEnter={playHover}>
              <span className="feature-icon">♾️</span>
              <h3>No Limits</h3>
              <p>Unlimited proposals. No paywall. Ever.</p>
            </div>
            <div className="feature-card" onMouseEnter={playHover}>
              <span className="feature-icon">📱</span>
              <h3>Works Offline</h3>
              <p>Install once. Runs like a native app.</p>
            </div>
          </div>
        </div>
      </section>



      {/* ═══════════════ SECTION 6: FINAL CTA ═══════════════ */}
      <section className="content-section cta-section">
        <div className="section-inner cta-inner">
          <h2 className="cta-title">
            Find your FYP partner.<br />Start now.
          </h2>
          <p className="cta-subtitle">
            100+ students already matching.<br />No BS. Just partners.
          </p>
          <Link href="/login">
            <button
              className="cta-primary cta-final"
              onClick={playConfirm}
              onMouseEnter={playHover}
            >
              GET STARTED →
            </button>
          </Link>
          <div className="creator-section">
            <a
              href="https://bento.me/shahmpooh"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playHover}
            >
              <button className="creator-button" onClick={playClick}>
                💙 Connect with Creator
              </button>
            </a>
          </div>
        </div>
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* ══════════ HERO SECTION ══════════ */
  .hero-section {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    position: relative;
  }

  .hero-content {
    max-width: 580px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 28px;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #2d2d2d;
    border: 2px solid #4387f4;
    padding: 8px 18px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    color: #4387f4;
    letter-spacing: 2px;
    animation: fadeInDown 0.6s ease-out;
  }

  .badge-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .hero-title {
    font-size: 72px;
    font-weight: 900;
    letter-spacing: -4px;
    line-height: 0.9;
    color: #ffffff;
    animation: fadeInUp 0.6s ease-out 0.1s both;
  }

  .highlight {
    color: #4387f4;
  }

  .hero-tagline {
    font-size: 18px;
    font-weight: 600;
    color: #999;
    line-height: 1.5;
    max-width: 440px;
    animation: fadeInUp 0.6s ease-out 0.2s both;
  }

  .tagline-emphasis {
    color: #ffffff;
    font-weight: 800;
  }

  /* Stats */
  .stats-bar {
    display: flex;
    align-items: center;
    gap: 24px;
    background: #2d2d2d;
    border: 3px solid #000;
    padding: 16px 32px;
    box-shadow: 6px 6px 0 #4387f4;
    animation: fadeInUp 0.6s ease-out 0.3s both;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-number {
    font-family: "Archivo Black", sans-serif;
    font-size: 28px;
    font-weight: 900;
    color: #4387f4;
    line-height: 1;
  }

  .stat-label {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 1px;
  }

  .stat-divider {
    width: 2px;
    height: 36px;
    background: #333;
  }

  /* CTAs */
  .cta-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 400px;
    animation: fadeInUp 0.6s ease-out 0.4s both;
  }

  .cta-primary {
    width: 100%;
    padding: 18px 32px;
    font-size: 20px;
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

  .cta-primary:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #2c5aa0;
  }

  .cta-primary:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .cta-secondary {
    width: 100%;
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    background: #2d2d2d;
    color: #fff;
    border: 3px solid #4387f4;
    box-shadow: 4px 4px 0 #4387f4;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cta-secondary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #4387f4;
    background: #333;
  }

  .cta-secondary:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  /* ══════════ CONTENT SECTIONS ══════════ */
  .content-section {
    padding: 100px 20px;
    position: relative;
  }

  .section-inner {
    max-width: 800px;
    margin: 0 auto;
  }

  .section-badge {
    display: inline-block;
    background: #4387f4;
    color: #fff;
    padding: 6px 16px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #2c5aa0;
    margin-bottom: 20px;
  }

  .roast-badge {
    background: #ff4444;
    box-shadow: 3px 3px 0 #cc0000;
  }

  .section-title {
    font-size: 48px;
    font-weight: 900;
    letter-spacing: -2px;
    color: #ffffff;
    margin-bottom: 40px;
    line-height: 1;
  }

  /* ══════════ ROAST GRID ══════════ */
  .roast-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
  }

  .roast-card {
    background: #2d2d2d;
    border: 3px solid #000;
    padding: 28px 24px;
    box-shadow: 5px 5px 0 #333;
    transition: all 0.2s;
  }

  .roast-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 8px 8px 0 #4387f4;
  }

  .roast-icon {
    font-size: 36px;
    margin-bottom: 16px;
  }

  .roast-card h3 {
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    color: #4387f4;
    margin-bottom: 10px;
    letter-spacing: -0.5px;
  }

  .roast-card p {
    font-size: 14px;
    font-weight: 500;
    color: #999;
    line-height: 1.6;
  }

  .roast-card p strong {
    color: #fff;
    font-weight: 800;
  }

  /* ══════════ STEPS ══════════ */
  .steps-container {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .step {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    padding: 24px;
    background: #2d2d2d;
    border: 3px solid #000;
    box-shadow: 5px 5px 0 #4387f4;
    transition: all 0.2s;
  }

  .step:hover {
    transform: translate(-3px, -3px);
    box-shadow: 8px 8px 0 #4387f4;
  }

  .step-number {
    font-family: "Archivo Black", sans-serif;
    font-size: 42px;
    font-weight: 900;
    color: #4387f4;
    line-height: 1;
    min-width: 60px;
  }

  .step-content h3 {
    font-size: 20px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
  }

  .step-content p {
    font-size: 14px;
    font-weight: 500;
    color: #999;
    line-height: 1.5;
  }

  .step-connector {
    width: 3px;
    height: 24px;
    background: #4387f4;
    margin-left: 50px;
  }

  /* ══════════ FEATURES SECTION ══════════ */
  .features-section {
    padding: 120px 20px;
    background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
  }

  .features-section .section-inner {
    max-width: 1000px;
  }

  .features-section .section-badge {
    padding: 8px 20px;
    font-size: 13px;
    letter-spacing: 3px;
  }

  .features-section .section-title {
    font-size: 56px;
    margin-bottom: 50px;
  }

  /* ══════════ FEATURES GRID ══════════ */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    max-width: 900px;
    margin: 0 auto;
  }

  .feature-card {
    background: #2d2d2d;
    border: 4px solid #000;
    padding: 40px 32px;
    box-shadow: 8px 8px 0 #4387f4;
    transition: all 0.2s;
    text-align: center;
  }

  .feature-card:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0 #4387f4;
    border-color: #4387f4;
  }

  .feature-icon {
    font-size: 56px;
    display: block;
    margin-bottom: 20px;
  }

  .feature-card h3 {
    font-size: 22px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
  }

  .feature-card p {
    font-size: 16px;
    font-weight: 600;
    color: #bbb;
    line-height: 1.6;
  }



  /* ══════════ FINAL CTA ══════════ */
  .cta-section {
    padding: 120px 20px;
    text-align: center;
  }

  .cta-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .cta-title {
    font-size: 52px;
    font-weight: 900;
    letter-spacing: -3px;
    color: #ffffff;
    margin-bottom: 20px;
    line-height: 1;
  }

  .cta-subtitle {
    font-size: 16px;
    font-weight: 600;
    color: #888;
    line-height: 1.6;
    margin-bottom: 36px;
  }

  .cta-final {
    max-width: 480px;
    font-size: 22px;
    padding: 22px 40px;
    box-shadow: 8px 8px 0 #2c5aa0;
  }

  .cta-final:hover {
    box-shadow: 12px 12px 0 #2c5aa0;
    transform: translate(-4px, -4px);
  }

  .creator-section {
    margin-top: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .creator-label {
    font-size: 14px;
    font-weight: 600;
    color: #888;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .creator-button {
    padding: 14px 32px;
    font-size: 15px;
    font-weight: 900;
    text-transform: uppercase;
    background: #2d2d2d;
    color: #4387f4;
    border: 3px solid #4387f4;
    box-shadow: 4px 4px 0 #4387f4;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.5px;
  }

  .creator-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #4387f4;
    background: #1a1a1a;
  }

  .creator-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  /* ══════════ ANIMATIONS ══════════ */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ══════════ RESPONSIVE ══════════ */
  @media (max-width: 640px) {
    .hero-title {
      font-size: 52px;
      letter-spacing: -3px;
    }

    .hero-tagline {
      font-size: 15px;
    }

    .stats-bar {
      gap: 16px;
      padding: 14px 20px;
    }

    .stat-number {
      font-size: 22px;
    }

    .section-title {
      font-size: 36px;
      letter-spacing: -1.5px;
    }

    .cta-title {
      font-size: 38px;
      letter-spacing: -2px;
    }

    .cta-final {
      font-size: 18px;
      padding: 18px 28px;
    }

    .step {
      gap: 16px;
      padding: 20px 16px;
    }

    .step-number {
      font-size: 32px;
      min-width: 44px;
    }

    .roast-grid {
      grid-template-columns: 1fr;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .feature-card {
      padding: 36px 28px;
      box-shadow: 6px 6px 0 #4387f4;
    }

    .feature-card:hover {
      box-shadow: 9px 9px 0 #4387f4;
    }

    .feature-icon {
      font-size: 48px;
    }

    .feature-card h3 {
      font-size: 20px;
    }

    .feature-card p {
      font-size: 15px;
    }

    .comparison-header > div,
    .comparison-row > div {
      padding: 10px 10px;
      font-size: 11px;
    }

    .content-section {
      padding: 60px 16px;
    }

    .features-section {
      padding: 80px 20px;
    }

    .features-section .section-title {
      font-size: 42px;
    }
  }

  @media (max-width: 380px) {
    .hero-title {
      font-size: 44px;
    }

    .stats-bar {
      gap: 12px;
      padding: 12px 16px;
    }

    .stat-number {
      font-size: 20px;
    }
  }
`;

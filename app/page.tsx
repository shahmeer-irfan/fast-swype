"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import BrutalistPattern from "@/components/BrutalistPattern";
import { useClickSound } from "@/hooks/useClickSound";

export default function Home() {
  const { playConfirm, playHover, playClick } = useClickSound();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
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

  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
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
            Stop searching WhatsApp groups.<br />
            <span className="tagline-emphasis">Swipe. Match. Build your FYP.</span>
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
              <span className="stat-number">0</span>
              <span className="stat-label">AI BS</span>
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
            <button
              className="cta-secondary"
              onClick={handleInstall}
              onMouseEnter={playHover}
              style={{ opacity: installPrompt ? 1 : 0.5, pointerEvents: installPrompt ? "auto" : "none" }}
            >
              📲 Install App
            </button>
          </div>

          {/* Scroll hint */}
          <div className="scroll-hint">
            <span>Scroll to see why we're different</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 2: WHY NOT AI ═══════════════ */}
      <section
        id="why-not-ai"
        ref={setSectionRef("why-not-ai")}
        className={`content-section ${visibleSections.has("why-not-ai") ? "visible" : ""}`}
      >
        <div className="section-inner">
          <div className="section-badge roast-badge">REALITY CHECK</div>
          <h2 className="section-title">
            Why let AI decide<br />your FYP partner?
          </h2>
          <div className="roast-grid">
            <div className="roast-card" onMouseEnter={playHover}>
              <div className="roast-icon">🤖</div>
              <h3>AI "Recommendations"</h3>
              <p>Cool buzzword. But does AI know who actually shows up to meetings? Who pulls all-nighters before deadlines? <strong>You do.</strong></p>
            </div>
            <div className="roast-card" onMouseEnter={playHover}>
              <div className="roast-icon">🎨</div>
              <h3>"Hobbies" Matching</h3>
              <p>Great, you both like Netflix. Does that mean they can write a REST API? <strong>Match on real tech skills, not hobbies.</strong></p>
            </div>
            <div className="roast-card" onMouseEnter={playHover}>
              <div className="roast-icon">💸</div>
              <h3>Paywalls Everywhere</h3>
              <p>Some apps charge you to send proposals. We think that's absurd. <strong>FastSwype is completely free. Forever.</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 3: HOW IT WORKS ═══════════════ */}
      <section
        id="how-it-works"
        ref={setSectionRef("how-it-works")}
        className={`content-section ${visibleSections.has("how-it-works") ? "visible" : ""}`}
      >
        <div className="section-inner">
          <div className="section-badge">3 STEPS</div>
          <h2 className="section-title">Dead simple.</h2>
          <div className="steps-container">
            <div className="step" onMouseEnter={playHover}>
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Build your profile</h3>
                <p>Add your real skills, domain, and what you're looking for. No fluff.</p>
              </div>
            </div>
            <div className="step-connector" />
            <div className="step" onMouseEnter={playHover}>
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Swipe through profiles</h3>
                <p>See actual tech stacks, domains, and availability. Left to pass, right to propose.</p>
              </div>
            </div>
            <div className="step-connector" />
            <div className="step" onMouseEnter={playHover}>
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Send unlimited proposals</h3>
                <p>No limits, no paywalls. If they accept, you both get each other's contact info.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 4: FEATURES ═══════════════ */}
      <section
        id="features"
        ref={setSectionRef("features")}
        className={`content-section ${visibleSections.has("features") ? "visible" : ""}`}
      >
        <div className="section-inner">
          <div className="section-badge">WHY FASTSWYPE</div>
          <h2 className="section-title">Built different.</h2>
          <div className="features-grid">
            <div className="feature-card" onMouseEnter={playHover}>
              <span className="feature-icon">⚡</span>
              <h3>Skill-Based Matching</h3>
              <p>Filter by React, Python, ML, Flutter — real tech, not "team player" nonsense</p>
            </div>
            <div className="feature-card" onMouseEnter={playHover}>
              <span className="feature-icon">🏫</span>
              <h3>Campus Filter</h3>
              <p>Lahore, Islamabad, Karachi, Peshawar — find partners from your campus or any FAST campus</p>
            </div>
            <div className="feature-card" onMouseEnter={playHover}>
              <span className="feature-icon">🔔</span>
              <h3>Push Notifications</h3>
              <p>Get notified instantly when someone sends you a proposal or accepts yours — even on mobile</p>
            </div>
            <div className="feature-card" onMouseEnter={playHover}>
              <span className="feature-icon">📱</span>
              <h3>Install as App</h3>
              <p>Works on Android & iOS. Add to home screen. No app store needed. Updates automatically</p>
            </div>
            <div className="feature-card" onMouseEnter={playHover}>
              <span className="feature-icon">🔒</span>
              <h3>FAST Verified</h3>
              <p>Only @nu.edu.pk emails allowed. No random people, no spam, just FAST students</p>
            </div>
            <div className="feature-card" onMouseEnter={playHover}>
              <span className="feature-icon">♾️</span>
              <h3>Zero Limits</h3>
              <p>Unlimited swipes. Unlimited proposals. No premium tier. No "upgrade to unlock." Free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 5: COMPARISON ═══════════════ */}
      <section
        id="comparison"
        ref={setSectionRef("comparison")}
        className={`content-section ${visibleSections.has("comparison") ? "visible" : ""}`}
      >
        <div className="section-inner">
          <div className="section-badge roast-badge">THE TRUTH</div>
          <h2 className="section-title">FastSwype vs "The Others"</h2>
          <div className="comparison-table">
            <div className="comparison-header">
              <div className="comparison-feature">Feature</div>
              <div className="comparison-us">FastSwype</div>
              <div className="comparison-them">Others</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-feature">Price</div>
              <div className="comparison-us">Free forever ✅</div>
              <div className="comparison-them">💰 Paywall</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-feature">Matching</div>
              <div className="comparison-us">Real skills ✅</div>
              <div className="comparison-them">🤖 "AI magic"</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-feature">Proposals</div>
              <div className="comparison-us">Unlimited ✅</div>
              <div className="comparison-them">🚫 Limited</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-feature">Notifications</div>
              <div className="comparison-us">Push notifs ✅</div>
              <div className="comparison-them">📧 Email only</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-feature">Install</div>
              <div className="comparison-us">PWA (instant) ✅</div>
              <div className="comparison-them">🌐 Web only</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-feature">Filters</div>
              <div className="comparison-us">Campus + Skills ✅</div>
              <div className="comparison-them">🎨 "Hobbies"</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 6: FINAL CTA ═══════════════ */}
      <section
        id="final-cta"
        ref={setSectionRef("final-cta")}
        className={`content-section cta-section ${visibleSections.has("final-cta") ? "visible" : ""}`}
      >
        <div className="section-inner cta-inner">
          <h2 className="cta-title">
            Your FYP partner is<br />one swipe away.
          </h2>
          <p className="cta-subtitle">
            No AI. No paywalls. No hobbies section.<br />Just real skills and real people.
          </p>
          <Link href="/login">
            <button
              className="cta-primary cta-final"
              onClick={playConfirm}
              onMouseEnter={playHover}
            >
              START SWIPING — IT'S FREE →
            </button>
          </Link>
          <div className="footer-links">
            <a
              href="https://bento.me/shahmpooh"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playHover}
              className="footer-link"
            >
              Built by a broke FAST student 💙
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

  /* Scroll hint */
  .scroll-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #555;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    animation: fadeInUp 0.6s ease-out 0.6s both;
  }

  .scroll-arrow {
    font-size: 18px;
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(8px); }
    60% { transform: translateY(4px); }
  }

  /* ══════════ CONTENT SECTIONS ══════════ */
  .content-section {
    padding: 100px 20px;
    position: relative;
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.7s ease-out;
  }

  .content-section.visible {
    opacity: 1;
    transform: translateY(0);
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

  /* ══════════ FEATURES GRID ══════════ */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .feature-card {
    background: #2d2d2d;
    border: 3px solid #000;
    padding: 24px 20px;
    box-shadow: 4px 4px 0 #333;
    transition: all 0.2s;
  }

  .feature-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #4387f4;
    border-color: #4387f4;
  }

  .feature-icon {
    font-size: 28px;
    display: block;
    margin-bottom: 12px;
  }

  .feature-card h3 {
    font-size: 15px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 6px;
    letter-spacing: -0.3px;
  }

  .feature-card p {
    font-size: 13px;
    font-weight: 500;
    color: #888;
    line-height: 1.5;
  }

  /* ══════════ COMPARISON TABLE ══════════ */
  .comparison-table {
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #4387f4;
    overflow: hidden;
  }

  .comparison-header {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    background: #4387f4;
    border-bottom: 3px solid #000;
  }

  .comparison-header > div {
    padding: 14px 16px;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    letter-spacing: 0.5px;
  }

  .comparison-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    border-bottom: 2px solid #333;
    transition: background 0.15s;
  }

  .comparison-row:last-child {
    border-bottom: none;
  }

  .comparison-row:hover {
    background: #2d2d2d;
  }

  .comparison-row > div {
    padding: 14px 16px;
    font-size: 13px;
    font-weight: 700;
  }

  .comparison-feature {
    color: #fff;
    font-weight: 900;
    text-transform: uppercase;
  }

  .comparison-us {
    color: #10b981;
  }

  .comparison-them {
    color: #666;
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

  .footer-links {
    margin-top: 40px;
  }

  .footer-link {
    font-size: 13px;
    font-weight: 700;
    color: #555;
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-link:hover {
    color: #4387f4;
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

    .roast-grid,
    .features-grid {
      grid-template-columns: 1fr;
    }

    .comparison-header > div,
    .comparison-row > div {
      padding: 10px 10px;
      font-size: 11px;
    }

    .content-section {
      padding: 60px 16px;
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

"use client";

import styled from "styled-components";
import BrutalistPattern from "@/components/BrutalistPattern";

export default function Home() {
  return (
    <StyledWrapper>
      <BrutalistPattern />
      <div className="maintenance-container">
        <div className="maintenance-card">
          <div className="loader-ring">
            <div className="ring-segment" />
            <div className="ring-segment" />
            <div className="ring-segment" />
          </div>
          <h1 className="title">
            Fast<span className="highlight">Swype</span>
          </h1>
          <div className="status-badge">
            <span className="pulse-dot" />
            BUILDING SOMETHING COOL
          </div>
          <p className="message">
            We&apos;re pushing a big update right now.<br />
            Hang tight &mdash; we&apos;ll be back in a few minutes.
          </p>
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
          <p className="sub-message">
            Follow updates on{" "}
            <a href="https://bento.me/shahmpooh" target="_blank" rel="noopener noreferrer">
              @shahmpooh
            </a>
          </p>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div
  .maintenance-container {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .maintenance-card {
    max-width: 460px;
    width: 100%;
    background: #2d2d2d;
    border: 3px solid #000;
    box-shadow: 8px 8px 0 #4387f4;
    padding: 48px 32px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .loader-ring {
    width: 60px;
    height: 60px;
    position: relative;
    animation: spin 2s linear infinite;
  }

  .ring-segment {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 4px solid transparent;
    border-top-color: #4387f4;
    border-radius: 50%;
  }

  .ring-segment:nth-child(2) {
    animation: spin 1.5s linear infinite reverse;
    border-top-color: #fff;
    width: 80%;
    height: 80%;
    top: 10%;
    left: 10%;
  }

  .ring-segment:nth-child(3) {
    animation: spin 1s linear infinite;
    border-top-color: #10b981;
    width: 60%;
    height: 60%;
    top: 20%;
    left: 20%;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .title {
    font-size: 48px;
    font-weight: 900;
    letter-spacing: -3px;
    color: #fff;
    line-height: 1;
    margin: 0;
  }

  .highlight {
    color: #4387f4;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #1a1a1a;
    border: 2px solid #4387f4;
    padding: 8px 18px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    color: #4387f4;
    letter-spacing: 2px;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  .message {
    font-size: 16px;
    font-weight: 600;
    color: #999;
    line-height: 1.6;
    margin: 0;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: #1a1a1a;
    border: 2px solid #000;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #4387f4;
    animation: loading 2s ease-in-out infinite;
  }

  @keyframes loading {
    0% { width: 0%; margin-left: 0; }
    50% { width: 70%; margin-left: 15%; }
    100% { width: 0%; margin-left: 100%; }
  }

  .sub-message {
    font-size: 13px;
    color: #555;
    margin: 0;
  }

  .sub-message a {
    color: #4387f4;
    text-decoration: none;
    font-weight: 700;
  }

  .sub-message a:hover {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .maintenance-card {
      padding: 36px 20px;
    }
    .title {
      font-size: 38px;
    }
  }
;

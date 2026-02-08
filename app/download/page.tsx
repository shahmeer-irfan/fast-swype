"use client";

import styled from "styled-components";
import BrutalistPattern from "@/components/BrutalistPattern";
import DownloadApp from "@/components/DownloadApp";
import Link from "next/link";
import { useClickSound } from "@/hooks/useClickSound";

export default function DownloadPage() {
  const { playClick, playHover } = useClickSound();

  return (
    <StyledWrapper>
      <BrutalistPattern />
      <div className="download-container">
        <div className="header">
          <Link href="/">
            <h1 className="logo" onMouseEnter={playHover}>FastSwype</h1>
          </Link>
          <Link href="/swipe">
            <button 
              className="back-button"
              onClick={playClick}
              onMouseEnter={playHover}
            >
              ← BACK
            </button>
          </Link>
        </div>

        <DownloadApp />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .download-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 20px;
    position: relative;
    max-width: 500px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
  }

  .logo {
    font-size: 36px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -2px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .logo:hover {
    transform: scale(1.05);
  }

  .back-button {
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #2c5aa0;
  }

  .back-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }
`;

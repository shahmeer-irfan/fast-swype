"use client";

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useClickSound } from '@/hooks/useClickSound';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { playClick } = useClickSound();

  useEffect(() => {
    setIsMounted(true);
    
    // Create audio element
    audioRef.current = new Audio('/music/background.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Set volume to 30%

    // Check if user previously disabled music, otherwise enable by default
    const savedState = localStorage.getItem('musicEnabled');
    if (savedState === null || savedState === 'true') {
      // Default to playing if no preference saved, or if user enabled it
      setIsPlaying(true);
      audioRef.current.play().catch(err => console.log('Autoplay prevented:', err));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    playClick(); // Play sound effect on toggle
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem('musicEnabled', 'false');
    } else {
      audioRef.current.play().catch(err => console.log('Play error:', err));
      setIsPlaying(true);
      localStorage.setItem('musicEnabled', 'true');
    }
  };

  if (!isMounted) return null;

  return (
    <StyledWrapper>
      <div className="music-player">
        <span className="music-label">{isPlaying ? '🔊' : '🔇'}</span>
        <label className="switch">
          <input 
            className="toggle" 
            type="checkbox" 
            checked={isPlaying}
            onChange={toggleMusic}
          />
          <span className="slider" />
        </label>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .music-player {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    padding: 12px 16px;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #58A0C8;
    transition: all 0.2s;
  }

  .music-player:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #58A0C8;
  }

  .music-label {
    font-size: 20px;
    line-height: 1;
  }

  .switch {
    --input-focus: #58A0C8;
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: #fff;
    --bg-color-alt: #666;
    --main-color: #000;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 20px;
  }

  .toggle {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .slider {
    box-sizing: border-box;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-color);
    transition: 0.3s;
  }

  .slider:before {
    box-sizing: border-box;
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    border: 2px solid var(--main-color);
    border-radius: 5px;
    left: -2px;
    bottom: 2px;
    background-color: var(--bg-color);
    box-shadow: 0 3px 0 var(--main-color);
    transition: 0.3s;
  }

  .toggle:checked + .slider {
    background-color: var(--input-focus);
  }

  .toggle:checked + .slider:before {
    transform: translateX(30px);
  }

  @media (max-width: 640px) {
    .music-player {
      bottom: 15px;
      right: 15px;
      padding: 10px 12px;
    }

    .music-label {
      font-size: 18px;
    }
  }
`;

export default MusicPlayer;

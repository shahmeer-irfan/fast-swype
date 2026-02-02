"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { useClickSound } from "@/hooks/useClickSound";

interface TooltipProps {
  message: string;
  storageKey: string; // Unique key to track if user has seen this
  delay?: number; // ms before showing
}

export default function Tooltip({ message, storageKey, delay = 2000 }: TooltipProps) {
  const [show, setShow] = useState(false);
  const { playClick } = useClickSound();

  useEffect(() => {
    // Check if user has seen this tooltip
    const hasSeenKey = `tooltip_seen_${storageKey}`;
    const hasSeen = localStorage.getItem(hasSeenKey);
    
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShow(true);
        // Auto-hide after 5 seconds
        setTimeout(() => {
          handleClose();
        }, 5000);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [storageKey, delay]);

  const handleClose = () => {
    playClick();
    setShow(false);
    localStorage.setItem(`tooltip_seen_${storageKey}`, 'true');
  };

  if (!show) return null;

  return (
    <TooltipWrapper>
      <TooltipBox>
        <TooltipIcon>💡</TooltipIcon>
        <TooltipText>{message}</TooltipText>
        <CloseButton onClick={handleClose}>×</CloseButton>
      </TooltipBox>
    </TooltipWrapper>
  );
}

const TooltipWrapper = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10000;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      transform: translateY(-100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 640px) {
    left: 20px;
    right: 20px;
    top: 70px;
  }
`;

const TooltipBox = styled.div`
  background: #2d2d2d;
  border: 3px solid #4387f4;
  box-shadow: 8px 8px 0 #4387f4;
  padding: 20px 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 420px;
  border-radius: 0;

  @media (max-width: 640px) {
    max-width: 100%;
    padding: 18px 20px;
  }
`;

const TooltipIcon = styled.div`
  font-size: 32px;
  flex-shrink: 0;
`;

const TooltipText = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.6;
  flex: 1;
  margin: 0;
  word-wrap: break-word;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: 2px solid #4387f4;
  background: #2d2d2d;
  color: #ffffff;
  font-size: 24px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover {
    background: #4387f4;
    color: #fff;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

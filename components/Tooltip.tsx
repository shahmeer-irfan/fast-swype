"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";

interface TooltipProps {
  message: string;
  storageKey: string; // Unique key to track if user has seen this
  delay?: number; // ms before showing
}

export default function Tooltip({ message, storageKey, delay = 2000 }: TooltipProps) {
  const [show, setShow] = useState(false);

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
  top: 20px;
  right: 20px;
  z-index: 10000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 640px) {
    left: 20px;
    right: 20px;
    top: 80px;
  }
`;

const TooltipBox = styled.div`
  background: #fff;
  border: 3px solid #000;
  box-shadow: 6px 6px 0 #000;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 320px;
`;

const TooltipIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`;

const TooltipText = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: #000;
  line-height: 1.4;
  flex: 1;
`;

const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  border: 2px solid #000;
  background: #fff;
  font-size: 20px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover {
    background: #000;
    color: #fff;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

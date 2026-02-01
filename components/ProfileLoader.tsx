"use client";

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Loader from './Loader';

const extractionSteps = [
  "Extracting your details...",
  "Fetching campus information...",
  "Loading batch data...",
  "Retrieving department...",
  "Setting up your profile...",
  "Almost there...",
];

export default function ProfileLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % extractionSteps.length);
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <StyledWrapper>
      <Loader />
      <div className="text-container">
        <p className="loading-text" key={currentStep}>
          {extractionSteps[currentStep]}
        </p>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0a0a0a;
  gap: 2rem;

  .text-container {
    position: relative;
    height: 30px;
    overflow: hidden;
  }

  .loading-text {
    font-family: 'Karla', sans-serif;
    font-size: 1rem;
    color: #999;
    text-align: center;
    animation: fadeInUp 0.5s ease-in-out;
    position: absolute;
    width: 100%;
    left: 0;
  }

  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

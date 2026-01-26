'use client';

import React from 'react';

const BrutalistPattern = () => {
  return (
    <div 
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{
        backgroundColor: '#1a1a1a',
        backgroundImage: 'radial-gradient(#4387f4 1.5px, #1a1a1a 1.5px)',
        backgroundSize: '30px 30px',
      }}
    />
  );
};

export default BrutalistPattern;

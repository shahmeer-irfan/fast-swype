'use client';

import React from 'react';

const BrutalistPattern = () => {
  return (
    <div 
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{
        backgroundColor: '#e5e5f7',
        backgroundImage: 'radial-gradient(#000000 1.5px, #e5e5f7 1.5px)',
        backgroundSize: '30px 30px',
      }}
    />
  );
};

export default BrutalistPattern;

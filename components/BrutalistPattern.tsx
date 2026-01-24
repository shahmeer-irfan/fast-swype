'use client';

import React from 'react';

const BrutalistPattern = () => {
  return (
    <div 
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{
        backgroundColor: '#FDF5AA',
        backgroundImage: 'radial-gradient(#113F67 1.5px, #FDF5AA 1.5px)',
        backgroundSize: '30px 30px',
      }}
    />
  );
};

export default BrutalistPattern;

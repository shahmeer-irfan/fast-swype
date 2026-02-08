/**
 * Screenshot Generator for PWABuilder
 * 
 * Generates placeholder screenshots for the PWA manifest.
 * 
 * Prerequisites: npm install sharp (already installed)
 * Usage: node scripts/generate-screenshots.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, '..', 'public', 'screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateScreenshots() {
  // Wide screenshot (desktop) - 1280x720
  const wideSvg = Buffer.from(`
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      
      <!-- Header bar -->
      <rect x="0" y="0" width="1280" height="70" fill="#2d2d2d" stroke="#4387f4" stroke-width="3"/>
      <text x="40" y="45" font-family="Arial Black, sans-serif" font-weight="900" font-size="28" fill="#4387f4">FASTSWYPE</text>
      
      <!-- Main card area -->
      <rect x="340" y="110" width="600" height="500" rx="0" fill="#2d2d2d" stroke="#4387f4" stroke-width="3"/>
      
      <!-- Profile placeholder -->
      <circle cx="640" cy="280" r="80" fill="#4387f4" opacity="0.3"/>
      <text x="640" y="290" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="40" fill="white">FS</text>
      
      <!-- Name -->
      <text x="640" y="400" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="24" fill="white">FIND YOUR FYP PARTNER</text>
      
      <!-- Subtitle -->
      <text x="640" y="440" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#888">Swipe to match with the perfect teammate</text>
      
      <!-- Buttons -->
      <rect x="420" y="480" width="120" height="45" fill="#e74c3c" stroke="#2d2d2d" stroke-width="3"/>
      <text x="480" y="510" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="16" fill="white">SKIP</text>
      
      <rect x="740" y="480" width="120" height="45" fill="#4387f4" stroke="#2d2d2d" stroke-width="3"/>
      <text x="800" y="510" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="16" fill="white">PROPOSE</text>
    </svg>
  `);

  await sharp(wideSvg)
    .resize(1280, 720)
    .png()
    .toFile(path.join(outputDir, 'screenshot-wide.png'));
  console.log('✅ Generated: screenshot-wide.png (1280x720)');

  // Mobile screenshot - 750x1334
  const mobileSvg = Buffer.from(`
    <svg width="750" height="1334" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      
      <!-- Status bar -->
      <rect x="0" y="0" width="750" height="50" fill="#2d2d2d"/>
      
      <!-- Header -->
      <rect x="0" y="50" width="750" height="70" fill="#2d2d2d" stroke="#4387f4" stroke-width="3"/>
      <text x="375" y="95" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="28" fill="#4387f4">FASTSWYPE</text>
      
      <!-- Main card -->
      <rect x="30" y="160" width="690" height="900" rx="0" fill="#2d2d2d" stroke="#4387f4" stroke-width="3"/>
      
      <!-- Profile circle -->
      <circle cx="375" cy="420" r="120" fill="#4387f4" opacity="0.3"/>
      <text x="375" y="430" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="60" fill="white">FS</text>
      
      <!-- Name -->
      <text x="375" y="600" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="30" fill="white">FIND YOUR</text>
      <text x="375" y="645" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="30" fill="white">FYP PARTNER</text>
      
      <!-- Description -->
      <text x="375" y="710" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#888">Swipe to match with the</text>
      <text x="375" y="740" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#888">perfect teammate at FAST</text>
      
      <!-- Skills tags -->
      <rect x="140" y="800" width="130" height="40" fill="#4387f4" stroke="#2d2d2d" stroke-width="2"/>
      <text x="205" y="825" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="14" fill="white">REACT</text>
      
      <rect x="290" y="800" width="170" height="40" fill="#4387f4" stroke="#2d2d2d" stroke-width="2"/>
      <text x="375" y="825" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="14" fill="white">NEXT.JS</text>
      
      <rect x="480" y="800" width="130" height="40" fill="#4387f4" stroke="#2d2d2d" stroke-width="2"/>
      <text x="545" y="825" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="14" fill="white">PYTHON</text>
      
      <!-- Action buttons -->
      <rect x="100" y="920" width="200" height="60" fill="#e74c3c" stroke="#2d2d2d" stroke-width="3"/>
      <text x="200" y="958" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="20" fill="white">SKIP</text>
      
      <rect x="450" y="920" width="200" height="60" fill="#4387f4" stroke="#2d2d2d" stroke-width="3"/>
      <text x="550" y="958" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="20" fill="white">PROPOSE</text>
      
      <!-- Bottom nav -->
      <rect x="0" y="1264" width="750" height="70" fill="#2d2d2d" stroke="#4387f4" stroke-width="2"/>
      <text x="150" y="1305" text-anchor="middle" font-family="Arial" font-size="14" fill="#888">SWIPE</text>
      <text x="375" y="1305" text-anchor="middle" font-family="Arial" font-size="14" fill="#888">PROPOSALS</text>
      <text x="600" y="1305" text-anchor="middle" font-family="Arial" font-size="14" fill="#888">PROFILE</text>
    </svg>
  `);

  await sharp(mobileSvg)
    .resize(750, 1334)
    .png()
    .toFile(path.join(outputDir, 'screenshot-mobile.png'));
  console.log('✅ Generated: screenshot-mobile.png (750x1334)');

  console.log('\n🎉 All screenshots generated!');
}

generateScreenshots().catch(console.error);

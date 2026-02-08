/**
 * Icon Generator Script
 * 
 * Run this script to generate all required PWA icons from your logo.svg
 * 
 * Prerequisites: npm install sharp
 * Usage: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '..', 'public', 'logo.svg');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    // Create a colored background with centered logo
    const background = Buffer.from(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#4387f4"/>
        <text 
          x="50%" y="50%" 
          text-anchor="middle" 
          dominant-baseline="central" 
          font-family="Arial Black, sans-serif" 
          font-weight="900" 
          font-size="${size * 0.35}px" 
          fill="white"
          letter-spacing="-2"
        >FS</text>
      </svg>`
    );

    await sharp(background)
      .resize(size, size)
      .png()
      .toFile(outputFile);

    console.log(`✅ Generated: icon-${size}x${size}.png`);
  }
  console.log('\n🎉 All icons generated!');
}

generateIcons().catch(console.error);

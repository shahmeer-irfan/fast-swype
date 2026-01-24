# Background Music Setup

## How to Add Background Music

1. **Add Your Music File**
   - Place your music file in this directory (`public/music/`)
   - Name it `background.mp3`
   - Recommended: Use a looping, non-intrusive background track

2. **Supported Formats**
   - MP3 (recommended)
   - WAV
   - OGG

3. **Music Recommendations**
   - Keep volume moderate (currently set to 30%)
   - Use instrumental or ambient music
   - File size: Under 5MB for faster loading
   - Duration: 2-5 minutes (it will loop automatically)

4. **Free Music Resources**
   - YouTube Audio Library (royalty-free)
   - Incompetech (Kevin MacLeod)
   - Bensound
   - Free Music Archive

## Current Settings

- **File**: `background.mp3`
- **Volume**: 30% (adjustable in MusicPlayer.tsx)
- **Loop**: Enabled
- **User Control**: Toggle switch in bottom-right corner
- **Storage**: User preference saved in localStorage

## Customization

Edit `components/MusicPlayer.tsx` to change:
- Volume level (line 18)
- Music file path (line 17)
- Player position (bottom-right by default)

import { useCallback } from 'react';

export const useClickSound = () => {
  // Soft click for general buttons
  const playClick = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 600;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  }, []);

  // Positive confirmation sound (Let's Go, Confirm)
  const playConfirm = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First tone
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    
    osc1.frequency.value = 520;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    
    // Second tone (higher, softer)
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    
    osc2.frequency.value = 780;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0, audioContext.currentTime + 0.03);
    gain2.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
    
    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.08);
    osc2.start(audioContext.currentTime + 0.03);
    osc2.stop(audioContext.currentTime + 0.12);
  }, []);

  // Subtle dismiss sound (Nah, Reject)
  const playDismiss = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 280;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.06);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.06);
  }, []);

  // Very light hover sound
  const playHover = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 900;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.03);
  }, []);

  // Elegant page transition whoosh
  const playTransition = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);

    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  }, []);

  // Woosh sound for swiping
  const playWoosh = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }, []);

  return { playClick, playConfirm, playDismiss, playHover, playTransition, playWoosh };
};


/**
 * BEEP SOUND HOOK
 * 
 * Creates and plays a synthetic beep sound using Web Audio API.
 */

import { useCallback, useRef } from "react";

export const useBeepSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Create oscillator for beep
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Configure beep sound
      oscillator.frequency.value = 880; // A5 note
      oscillator.type = 'sine';
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      // Play beep
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
      
      // Play second beep for confirmation effect
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.frequency.value = 1100; // Higher note
        osc2.type = 'sine';
        
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.2);
      }, 100);
    } catch (error) {
      console.log('Audio playback not available:', error);
    }
  }, []);

  return { playBeep };
};

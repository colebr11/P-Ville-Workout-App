import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

// Milestone announcements for set rest (in seconds remaining)
const SET_REST_ANNOUNCEMENTS = [120, 60, 15];

export function useAudio() {
  const shortBeepRef = useRef(null);
  const longBeepRef = useRef(null);
  const announcedRef = useRef(new Set());

  // Load sounds once on mount
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,       // play even when silent switch is on
          staysActiveInBackground: true,     // keep playing when screen locks
          shouldDuckAndroid: true,
        });

        const { sound: short } = await Audio.Sound.createAsync(
          require('../../assets/sounds/beep_short.wav'),
          { shouldPlay: false, volume: 1.0 }
        );
        const { sound: long } = await Audio.Sound.createAsync(
          require('../../assets/sounds/beep_long.wav'),
          { shouldPlay: false, volume: 1.0 }
        );

        if (mounted) {
          shortBeepRef.current = short;
          longBeepRef.current = long;
        }
      } catch (e) {
        console.warn('Audio load error:', e);
      }
    }

    load();
    return () => {
      mounted = false;
      shortBeepRef.current?.unloadAsync();
      longBeepRef.current?.unloadAsync();
    };
  }, []);

  const playShort = useCallback(async () => {
    try {
      const s = shortBeepRef.current;
      if (!s) return;
      await s.setPositionAsync(0);
      await s.playAsync();
    } catch {}
  }, []);

  const playLong = useCallback(async () => {
    try {
      const s = longBeepRef.current;
      if (!s) return;
      await s.setPositionAsync(0);
      await s.playAsync();
    } catch {}
  }, []);

  const speak = useCallback((text) => {
    try {
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch {}
  }, []);

  // Call this every tick — handles countdown beeps and set rest announcements
  const handleTick = useCallback((phase, timeRemaining, phaseDuration) => {
    const secs = Math.ceil(timeRemaining);

    if (phase === 'SPRINT' || phase === 'REST') {
      // 3, 2, 1 countdown beeps
      if (secs === 3 || secs === 2 || secs === 1) {
        playShort();
      }
      // Long beep on zero (transition)
      if (timeRemaining <= 0.15 && timeRemaining > 0) {
        playLong();
      }
    }

    if (phase === 'SET_REST') {
      // Same 3,2,1 + long beep at end
      if (secs === 3 || secs === 2 || secs === 1) {
        playShort();
      }
      if (timeRemaining <= 0.15 && timeRemaining > 0) {
        playLong();
      }

      // Voice announcements at 2min, 1min, 15sec
      for (const milestone of SET_REST_ANNOUNCEMENTS) {
        if (!announcedRef.current.has(milestone) && secs === milestone) {
          announcedRef.current.add(milestone);
          if (milestone === 120) speak('2 minutes remaining');
          if (milestone === 60) speak('1 minute remaining');
          if (milestone === 15) speak('15 seconds remaining');
        }
      }
    }
  }, [playShort, playLong, speak]);

  // Reset announcements when phase changes
  const resetAnnouncements = useCallback(() => {
    announcedRef.current = new Set();
  }, []);

  return { handleTick, resetAnnouncements };
}


import { useState, useEffect, useRef } from 'react';
import type { ColorStep } from '../types';

export const useColorChanger = (
  pattern: ColorStep[],
  isPlaying: boolean
): [string, () => void] => {
  // Initialize with the first color or a safe default
  const [currentColor, setCurrentColor] = useState<string>(
    pattern.length > 0 ? pattern[0].color : '#111827'
  );

  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || pattern.length === 0) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }

    const updateColor = () => {
      const totalDurationMs = pattern.reduce((acc, step) => acc + step.duration, 0) * 1000;
      
      if (totalDurationMs === 0) {
         setCurrentColor(pattern[0].color);
         requestRef.current = requestAnimationFrame(updateColor);
         return;
      }

      // Absolute Time Strategy:
      // Calculate the current position in the loop based on the system clock (Unix Epoch).
      // This ensures that any device running the same pattern will display the same
      // color at the exact same time, allowing for easy synchronization.
      const now = Date.now();
      let timeIntoCycle = now % totalDurationMs;

      // Find which step corresponds to this time offset
      let activeColor = pattern[0].color;
      for (const step of pattern) {
        const stepDurationMs = step.duration * 1000;
        if (timeIntoCycle < stepDurationMs) {
          activeColor = step.color;
          break;
        }
        timeIntoCycle -= stepDurationMs;
      }

      // Optimize: React only re-renders if value actually changes
      setCurrentColor(activeColor);
      
      requestRef.current = requestAnimationFrame(updateColor);
    };

    requestRef.current = requestAnimationFrame(updateColor);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isPlaying, pattern]);

  const reset = () => {
    // Visual reset to the first color when stopped.
    // (Note: Pressing play again will immediately jump to the correct absolute time color)
    if (pattern.length > 0) {
      setCurrentColor(pattern[0].color);
    }
  };

  return [currentColor, reset];
};

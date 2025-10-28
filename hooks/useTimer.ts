import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialSeconds: number) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (secondsLeft > 0) {
      setIsActive(true);
    }
  }, [secondsLeft]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  // FIX: Updated reset to accept an optional new time value. This fixes a runtime error in FocusView.tsx
  // where reset was being called with an argument but defined to take none.
  const reset = useCallback((newSeconds?: number) => {
    setIsActive(false);
    setSecondsLeft(newSeconds !== undefined ? newSeconds : initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    if (secondsLeft === 0) {
        setIsActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, secondsLeft]);

  return { secondsLeft, isActive, start, pause, reset };
};

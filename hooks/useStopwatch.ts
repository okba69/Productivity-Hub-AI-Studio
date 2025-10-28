import { useState, useRef, useCallback, useEffect } from 'react';

export const useStopwatch = (initialSeconds: number = 0) => {
  const [time, setTime] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
    }
  }, [isActive]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback((newInitialTime: number = 0) => {
    pause();
    setTime(newInitialTime);
  }, [pause]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  return { time, isActive, start, pause, reset };
};

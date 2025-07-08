import { useRef, useCallback } from 'react';

interface SwipeConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useSwipe = (config: SwipeConfig = {}) => {
  const {
    minSwipeDistance = 50,
    maxSwipeTime = 300,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = config;

  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const timeDiff = touchEnd.current.time - touchStart.current.time;

    const isSwipe = Math.abs(distanceX) > minSwipeDistance || Math.abs(distanceY) > minSwipeDistance;
    const isTimeValid = timeDiff < maxSwipeTime;

    if (isSwipe && isTimeValid) {
      const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
      
      if (isHorizontalSwipe) {
        if (distanceX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (distanceX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      } else {
        if (distanceY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (distanceY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    }

    // Reset
    touchStart.current = null;
    touchEnd.current = null;
  }, [minSwipeDistance, maxSwipeTime, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
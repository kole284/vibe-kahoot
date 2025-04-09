import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  duration: number;
  isActive: boolean;
  skipTimer?: boolean;
  onComplete: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  duration,
  isActive,
  skipTimer = false,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);
  
  // Log prop changes for debugging
  useEffect(() => {
    console.log(`[Timer] Props updated: duration=${duration}, isActive=${isActive}, skipTimer=${skipTimer}`);
  }, [duration, isActive, skipTimer]);

  // Reset timer when key changes (component remounts) or duration changes
  useEffect(() => {
    console.log(`[Timer] RESET - duration: ${duration}`);
    setTimeLeft(duration);
    hasCompletedRef.current = false;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      console.log('[Timer] Cleanup on unmount or key change');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [duration]);
  
  // Handle active state changes
  useEffect(() => {
    if (!isActive && timerRef.current) {
      console.log('[Timer] Stopping timer because isActive is false');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isActive]);

  // Handle skip timer condition - highest priority
  useEffect(() => {
    if (skipTimer && !hasCompletedRef.current) {
      console.log('[Timer] SKIP TIMER triggered');
      
      // Clear any running timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setTimeLeft(0);
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [skipTimer, onComplete]);

  // Main timer functionality
  useEffect(() => {
    // Don't start timer if it should be skipped, is inactive, or already at 0
    if (skipTimer || !isActive || timeLeft <= 0 || hasCompletedRef.current || timerRef.current) {
      return;
    }

    console.log('[Timer] Starting countdown from', timeLeft);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        console.log(`[Timer] Tick: ${newTime}s remaining`);
        
        if (newTime <= 0) {
          console.log('[Timer] Timer naturally completed');
          clearInterval(timerRef.current as NodeJS.Timeout);
          timerRef.current = null;
          
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onComplete();
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        console.log('[Timer] Cleaning up timer in main effect');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, skipTimer, timeLeft, onComplete]);

  // Calculate progress percentage
  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / duration) * 100));
  
  // Determine color based on time left
  let progressColor = 'bg-highlight';
  if (timeLeft < duration * 0.3) {
    progressColor = 'bg-secondary';
  } else if (timeLeft < duration * 0.6) {
    progressColor = 'bg-special';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Time Remaining</span>
        <span className="text-sm font-medium">{timeLeft}s</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <motion.div
          className={`${progressColor} h-4 rounded-full`}
          initial={{ width: "100%" }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}; 
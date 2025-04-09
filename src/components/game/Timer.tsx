import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  duration: number;
  onComplete: () => void;
  isActive: boolean;
}

export function Timer({ duration, onComplete, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reset timer when duration changes or component mounts
  useEffect(() => {
    setTimeLeft(duration);
    startTimeRef.current = null;
    clearTimer();
  }, [duration, clearTimer]);

  // Main timer effect
  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      clearTimer();
      startTimeRef.current = null;
      return;
    }

    // Start new timer
    if (!timerRef.current) {
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = startTimeRef.current ? Math.floor((now - startTimeRef.current) / 1000) : 0;
        const newTimeLeft = Math.max(0, duration - elapsed);

        if (newTimeLeft <= 0) {
          clearTimer();
          setTimeLeft(0);
          onComplete();
        } else {
          setTimeLeft(newTimeLeft);
        }
      }, 100); // Update more frequently for smoother countdown
    }

    // Cleanup
    return () => {
      clearTimer();
    };
  }, [isActive, duration, onComplete, clearTimer]);

  // Calculate progress percentage
  const progress = Math.max(0, Math.min(100, (timeLeft / duration) * 100));

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
          className={`absolute top-0 left-0 h-full ${
            timeLeft > duration / 2
              ? 'bg-green-500'
              : timeLeft > duration / 4
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        />
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {Math.ceil(timeLeft)}s
          </span>
        </div>
      </div>
    </div>
  );
} 
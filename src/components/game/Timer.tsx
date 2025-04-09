import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  duration: number;
  onComplete: () => void;
  isActive: boolean;
  skipTimer?: boolean;
}

export function Timer({ duration, onComplete, isActive, skipTimer = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  // Reset timer when duration changes or when isActive changes
  useEffect(() => {
    console.log("Timer reset due to duration or isActive change");
    setTimeLeft(duration);
  }, [duration, isActive]);

  // Handle skip timer condition immediately
  useEffect(() => {
    if (skipTimer) {
      console.log("Timer skipped - all players answered");
      setTimeLeft(0);
      onComplete();
    }
  }, [skipTimer, onComplete]);

  // Main timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    // Don't start timer if we're skipping or not active
    if (skipTimer || !isActive || timeLeft <= 0) {
      return;
    }

    console.log("Starting timer with", timeLeft, "seconds");
    timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newValue = prev - 1;
        console.log("Timer tick:", newValue);
        if (newValue <= 0) {
          if (timer) clearInterval(timer);
          console.log("Timer completed naturally");
          onComplete();
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => {
      if (timer) {
        console.log("Cleaning up timer");
        clearInterval(timer);
      }
    };
  }, [isActive, skipTimer, timeLeft, onComplete]);

  const progress = (timeLeft / duration) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
          className={`absolute top-0 left-0 h-full ${
            timeLeft > duration / 2
              ? 'bg-green-500'
              : timeLeft > duration / 4
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        />
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-white font-bold">{timeLeft}s</span>
        </div>
      </div>
    </div>
  );
} 
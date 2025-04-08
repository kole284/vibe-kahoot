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
  
  // Debug
  useEffect(() => {
    console.log("Timer component:", { duration, isActive, skipTimer, timeLeft });
  }, [duration, isActive, skipTimer, timeLeft]);

  // Reset timer when duration or active status changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, isActive]);

  useEffect(() => {
    // Skip timer if all players have answered
    if (skipTimer) {
      console.log("Skipping timer as all players answered");
      onComplete();
      return;
    }
    
    if (!isActive) {
      console.log("Timer not active");
      return;
    }

    console.log("Starting timer with", timeLeft, "seconds");
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newValue = prev - 1;
        console.log("Timer tick:", newValue);
        if (newValue <= 0) {
          clearInterval(timer);
          console.log("Timer completed");
          onComplete();
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => {
      console.log("Cleaning up timer");
      clearInterval(timer);
    };
  }, [isActive, onComplete, skipTimer, timeLeft, duration]);

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
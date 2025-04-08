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

  useEffect(() => {
    // Reset timer when duration changes
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    // Skip timer if all players have answered
    if (skipTimer) {
      onComplete();
      return;
    }
    
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onComplete, skipTimer]);

  const progress = (timeLeft / duration) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
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
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
  
  // Determine the color and pulse animation based on time remaining
  const getTimerColor = () => {
    if (timeLeft > duration / 2) return 'bg-green-500';
    if (timeLeft > duration / 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const shouldPulse = timeLeft <= 5;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-1 text-center">
        <span className="text-lg font-semibold">Preostalo vreme:</span>
      </div>
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ 
            width: `${progress}%`,
            scale: shouldPulse ? [1, 1.03, 1] : 1
          }}
          transition={{ 
            width: { duration: 1, ease: 'linear' },
            scale: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' } 
          }}
          className={`absolute top-0 left-0 h-full ${getTimerColor()}`}
        />
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-white text-xl font-bold drop-shadow-md">{timeLeft}s</span>
        </div>
      </div>
    </div>
  );
} 
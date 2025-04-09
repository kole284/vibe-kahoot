import { motion } from 'framer-motion';

interface TimerDisplayProps {
  duration: number; // Total duration to calculate progress
  timeLeft: number; // Current time left passed as prop
}

export function Timer({ duration, timeLeft }: TimerDisplayProps) {
  // Ensure timeLeft is within bounds [0, duration]
  const validTimeLeft = Math.max(0, Math.min(timeLeft, duration));
  
  // Calculate progress percentage
  const progress = duration > 0 ? (validTimeLeft / duration) * 100 : 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          // Animate width based on progress
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }} // Faster transition for smoother updates
          className={`absolute top-0 left-0 h-full ${
            validTimeLeft > duration / 2
              ? 'bg-green-500'
              : validTimeLeft > duration / 4
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        />
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {/* Display rounded up time */}
            {Math.ceil(validTimeLeft)}s
          </span>
        </div>
      </div>
    </div>
  );
} 
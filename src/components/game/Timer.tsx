import { motion } from 'framer-motion';

interface TimerProps {
  timeLeft: number;
  duration: number;
}

export function Timer({ timeLeft, duration }: TimerProps) {
  // Ensure values are valid
  const safeTimeLeft = Math.max(0, Math.min(timeLeft, duration));
  const progress = (safeTimeLeft / duration) * 100;
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'linear', duration: 0.3 }}
          className={`absolute top-0 left-0 h-full ${
            safeTimeLeft > duration / 2
              ? 'bg-green-500'
              : safeTimeLeft > duration / 4
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        />
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {Math.ceil(safeTimeLeft)}s
          </span>
        </div>
      </div>
    </div>
  );
} 
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';

const optionColors = {
  A: 'bg-red-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-green-500'
};

export function Question() {
  const { currentQuestion, submitAnswer, gameState } = useGame();

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xl">Loading question...</p>
      </div>
    );
  }

  const handleAnswer = async (answer: string) => {
    await submitAnswer(answer);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-4 h-full"
    >
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {currentQuestion.text}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            const optionKey = String.fromCharCode(65 + index);
            return (
              <motion.button
                key={optionKey}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(optionKey)}
                className={`${optionColors[optionKey as keyof typeof optionColors]} p-4 rounded-lg text-white text-xl font-bold`}
              >
                {optionKey}: {option}
              </motion.button>
            );
          })}
        </div>

        {gameState.phase === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="text-xl">
              Correct answer: {currentQuestion.correctAnswer}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 
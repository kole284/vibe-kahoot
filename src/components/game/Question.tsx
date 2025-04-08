import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

const optionColors = {
  A: 'bg-red-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-green-500'
};

export function Question() {
  const { currentQuestion, submitAnswer, gameState } = useGame();
  const [searchParams] = useSearchParams();
  const [debugInfo, setDebugInfo] = useState<string>('');
  const gameId = searchParams.get('gameId');
  const playerId = searchParams.get('playerId');

  useEffect(() => {
    // Log debug information
    const info = `Game ID: ${gameId}, Player ID: ${playerId}
Current Question: ${currentQuestion ? 'Loaded' : 'Not loaded'}
Game State: ${JSON.stringify(gameState, null, 2)}`;
    
    setDebugInfo(info);
  }, [gameId, playerId, currentQuestion, gameState]);

  if (gameState.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-xl mb-4">Loading game data...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-xl text-red-500 mb-4">Error: {gameState.error}</p>
        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64 w-full max-w-xl">
            <pre className="whitespace-pre-wrap break-all">{debugInfo}</pre>
          </div>
        )}
      </div>
    );
  }

  if (!gameState.session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-xl mb-4">No game session found</p>
        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64 w-full max-w-xl">
            <pre className="whitespace-pre-wrap break-all">{debugInfo}</pre>
          </div>
        )}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-xl mb-4">Loading question...</p>
        <div className="animate-pulse bg-gray-200 h-4 w-32 rounded mb-4"></div>
        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64 w-full max-w-xl">
            <pre className="whitespace-pre-wrap break-all">{debugInfo}</pre>
          </div>
        )}
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
      className="flex flex-col items-center justify-center p-4 min-h-screen"
    >
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          {currentQuestion.text}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            const optionKey = String.fromCharCode(65 + index);
            return (
              <motion.button
                key={optionKey}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(optionKey)}
                className={`${optionColors[optionKey as keyof typeof optionColors]} p-4 rounded-lg text-white text-lg md:text-xl font-bold`}
              >
                {optionKey}: {option}
              </motion.button>
            );
          })}
        </div>

        {gameState.session.status === 'finished' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="text-xl">
              Correct answer: {String.fromCharCode(65 + currentQuestion.correctOptionIndex)}
            </p>
          </motion.div>
        )}
      </div>
      
      {debugInfo && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32 w-full max-w-xl">
          <pre className="whitespace-pre-wrap break-all">{debugInfo}</pre>
        </div>
      )}
    </motion.div>
  );
} 
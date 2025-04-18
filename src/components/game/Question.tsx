import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { Timer } from './Timer';

const optionColors = {
  A: 'bg-red-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-green-500'
};

interface QuestionProps {
  showDebugInfo?: boolean;
  showCorrectAnswer?: boolean;
}

export function Question({ showDebugInfo = false, showCorrectAnswer = false }: QuestionProps) {
  const { currentQuestion, submitAnswer, gameState } = useGame();
  const [searchParams] = useSearchParams();
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const gameId = searchParams.get('gameId');
  const playerId = searchParams.get('playerId');

  // Reset state when question changes
  useEffect(() => {
    setHasAnswered(false);
    setSelectedOption(null);
    setIsTransitioning(false);
  }, [currentQuestion?.id]);

  // Transition effect when showing correct answer
  useEffect(() => {
    if (showCorrectAnswer) {
      setIsTransitioning(true);
    } else {
      setIsTransitioning(false);
    }
  }, [showCorrectAnswer]);

  // Log debug information
  useEffect(() => {
    if (!showDebugInfo) return;
    
    const info = `Game ID: ${gameId}, Player ID: ${playerId}
Current Question: ${currentQuestion ? 'Loaded' : 'Not loaded'}
Game State: ${JSON.stringify(gameState, null, 2)}`;
    
    setDebugInfo(info);
  }, [gameId, playerId, currentQuestion, gameState, showDebugInfo]);

  const handleAnswer = async (answer: string) => {
    if (hasAnswered || showCorrectAnswer) return;
    setHasAnswered(true);
    setSelectedOption(answer);
    await submitAnswer(answer);
  };

  // Function to determine button class based on game state and answer
  const getButtonClass = (optionKey: string) => {
    if (!currentQuestion) return '';
    
    const baseClass = `p-4 rounded-lg text-white text-lg md:text-xl font-bold ${optionColors[optionKey as keyof typeof optionColors]}`;
    
    // When showing correct answer, highlight the correct one
    if (showCorrectAnswer) {
      const correctOptionKey = String.fromCharCode(65 + currentQuestion.correctOptionIndex);
      
      if (optionKey === correctOptionKey) {
        return `${baseClass} ring-4 ring-green-300 bg-opacity-100 scale-105 shadow-lg`;
      } else if (optionKey === selectedOption) {
        return `${baseClass} opacity-50 bg-opacity-50`;
      } else {
        return `${baseClass} opacity-50 bg-opacity-50`;
      }
    }
    
    // When player has answered but answers aren't shown yet
    if (hasAnswered && optionKey === selectedOption) {
      return `${baseClass} ring-2 ring-white`;
    }
    
    return baseClass;
  };

  if (gameState.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-xl mb-4">Učitavanje igre...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-xl text-red-500 mb-4">Greška: {gameState.error}</p>
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
        <p className="text-xl mb-4">Igra nije pronađena</p>
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
        <p className="text-xl mb-4">Učitavanje pitanja...</p>
        <div className="animate-pulse bg-gray-200 h-4 w-32 rounded mb-4"></div>
        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64 w-full max-w-xl">
            <pre className="whitespace-pre-wrap break-all">{debugInfo}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center p-4 min-h-screen"
    >
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <motion.div
          animate={{
            opacity: isTransitioning ? 0.8 : 1,
            scale: isTransitioning ? 0.98 : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
            {currentQuestion.text}
          </h2>
          
          <div className="mb-6 text-center">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {gameState.session?.categories?.[gameState.session.currentCategory] || 'Kategorija'} • Pitanje {(gameState.session?.currentQuestionIndex || 0) + 1}/8
            </span>
          </div>

          {/* Player Timer Display */}
          <div className="mb-6">
            <Timer 
              timeLeft={gameState.session?.timeRemaining ?? 15} 
              duration={15}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              const optionKey = String.fromCharCode(65 + index);
              const isCorrectAnswer = showCorrectAnswer && 
                optionKey === String.fromCharCode(65 + currentQuestion.correctOptionIndex);
              
              return (
                <motion.button
                  key={optionKey}
                  whileHover={!hasAnswered && !showCorrectAnswer ? { scale: 1.05 } : {}}
                  whileTap={!hasAnswered && !showCorrectAnswer ? { scale: 0.95 } : {}}
                  animate={isCorrectAnswer ? {
                    scale: [1, 1.1, 1.05],
                    transition: {
                      duration: 0.5,
                      times: [0, 0.5, 1],
                      ease: "easeInOut"
                    }
                  } : {}}
                  onClick={() => handleAnswer(optionKey)}
                  disabled={hasAnswered || showCorrectAnswer}
                  className={getButtonClass(optionKey)}
                >
                  {optionKey}: {option}
                </motion.button>
              );
            })}
          </div>

          {showCorrectAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <p className="text-xl font-bold text-green-600">
                Tačan odgovor: {String.fromCharCode(65 + currentQuestion.correctOptionIndex)}
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-600 mt-2"
              >
                Sledeće pitanje za nekoliko sekundi...
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {debugInfo && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64 w-full max-w-xl">
          <pre className="whitespace-pre-wrap break-all">{debugInfo}</pre>
        </div>
      )}
    </motion.div>
  );
} 
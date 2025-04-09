import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Timer } from '../game/Timer';
import { useGame } from '../../context/GameContext';
import { rtdb } from '../../lib/firebase/firebase';
import { ref, get, update } from 'firebase/database';

export const ProjectorView: React.FC = () => {
  const { gameState, currentQuestion, nextQuestion } = useGame();
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(false);
  const [timerKey, setTimerKey] = useState<number>(0);
  const nextQuestionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Log current game state for debugging
  useEffect(() => {
    console.log("Game state:", gameState);
    console.log("Current question:", currentQuestion);
    
    // Reset timer key when question changes or when showing correct answer resets
    if (currentQuestion) {
      console.log("Resetting timer with new key");
      setTimerKey(prev => prev + 1);
      setShowCorrectAnswer(false);
    }
  }, [gameState?.session?.currentQuestionIndex, gameState?.session?.currentCategory, currentQuestion]);

  // Additional effect to reset timer when allPlayersAnswered changes to false
  useEffect(() => {
    if (gameState?.session?.allPlayersAnswered === false && currentQuestion) {
      console.log("All players answered reset to false, resetting timer");
      setTimerKey(prev => prev + 1);
      setShowCorrectAnswer(false);
    }
  }, [gameState?.session?.allPlayersAnswered, currentQuestion]);

  // Check if all players have answered
  useEffect(() => {
    if (!gameState || !gameState.session || showCorrectAnswer) return;
    
    const checkInterval = setInterval(async () => {
      try {
        if (gameState.session?.allPlayersAnswered || gameState.session?.showingCorrectAnswer) {
          console.log("All players answered or showing correct answer");
          setShowCorrectAnswer(true);
          clearInterval(checkInterval);
        }
      } catch (error) {
        console.error("Error checking if all players answered:", error);
      }
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, [gameState, showCorrectAnswer]);
  
  // Handle showing correct answer and moving to next question
  useEffect(() => {
    if (!showCorrectAnswer || !gameState) return;
    
    console.log("Showing correct answer");
    updateGameShowingCorrectAnswer();
    
    const nextQuestionTimer = setTimeout(() => {
      console.log("Moving to next question after showing correct answer");
      nextQuestion();
      setShowCorrectAnswer(false);
    }, 5000);
    
    return () => clearTimeout(nextQuestionTimer);
  }, [showCorrectAnswer, gameState, nextQuestion]);

  const handleTimerComplete = async () => {
    console.log("Timer completed, showing correct answer");
    
    // First update local state
    setShowCorrectAnswer(true);
    
    // Then update Firebase state if not already done
    try {
      if (!gameState || !gameState.session || !gameState.session.id) {
        console.error("Cannot update game state: missing session data");
        return;
      }
      
      const gameRef = ref(rtdb, `games/${gameState.session.id}`);
      const snapshot = await get(gameRef);
      
      if (!snapshot.exists()) {
        console.error("Game not found when trying to update state");
        return;
      }
      
      const gameData = snapshot.val();
      
      // Only update if not already showing correct answer
      if (!gameData.showingCorrectAnswer) {
        console.log("Updating Firebase: setting showingCorrectAnswer and allPlayersAnswered to true");
        await update(gameRef, {
          showingCorrectAnswer: true,
          allPlayersAnswered: true
        });
      }
    } catch (error) {
      console.error("Error in handleTimerComplete:", error);
    }
  };

  const updateGameShowingCorrectAnswer = async () => {
    try {
      if (!gameState || !gameState.session || !gameState.session.id) return;
      console.log("Updating game state: showing correct answer");
      
      const gameRef = ref(rtdb, `games/${gameState.session.id}`);
      await update(gameRef, {
        showingCorrectAnswer: true,
        allPlayersAnswered: true
      });
    } catch (error) {
      console.error("Error updating game state:", error);
    }
  };

  if (!gameState.session || !currentQuestion) {
    return <div className="p-8 text-center">Loading question...</div>;
  }

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <Timer
            key={timerKey}
            duration={30} // 30 seconds per question
            isActive={!showCorrectAnswer}
            skipTimer={gameState.session.allPlayersAnswered || false}
            onComplete={handleTimerComplete}
          />
        </div>

        <div className="bg-accent rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">{currentQuestion.text}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isCorrect = index === currentQuestion.correctOptionIndex;
              
              return (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg ${
                    showCorrectAnswer && isCorrect
                      ? 'bg-highlight text-white'
                      : showCorrectAnswer && !isCorrect
                      ? 'bg-gray-300'
                      : 'bg-white'
                  } shadow flex items-center`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-xl font-bold mr-3">{letters[index]}.</span>
                  <span className="text-lg">{option}</span>
                  {showCorrectAnswer && isCorrect && (
                    <span className="ml-auto text-2xl">✓</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {showCorrectAnswer && (
          <motion.div
            className="bg-highlight text-white p-4 rounded-lg text-center text-xl font-bold"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Correct Answer: {String.fromCharCode(65 + currentQuestion.correctOptionIndex)}
          </motion.div>
        )}
      </div>
    </div>
  );
};
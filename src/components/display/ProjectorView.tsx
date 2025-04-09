import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Question } from '../game/Question';
import { Timer } from '../game/Timer';
import { TeamCard } from '../game/TeamCard';
import { ref, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase/firebase';

export function ProjectorView() {
  const { gameState, teams, currentQuestion, nextQuestion, checkAllPlayersAnswered } = useGame();
  const [leaderboardTimer, setLeaderboardTimer] = useState<number | null>(null);
  const [showingCorrectAnswer, setShowingCorrectAnswer] = useState(false);
  
  // Debug - log game state to see what's happening
  useEffect(() => {
    console.log("Current game state:", gameState);
    console.log("Current question:", currentQuestion);
  }, [gameState, currentQuestion]);
  
  // This effect checks if all players have answered to potentially skip the timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (gameState.session?.status === 'playing' && !showingCorrectAnswer) {
        checkAllPlayersAnswered();
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [checkAllPlayersAnswered, gameState.session?.status, showingCorrectAnswer]);
  
  // This effect manages showing correct answer timing
  useEffect(() => {
    // If game state indicates all players answered or we're showing correct answer
    if (gameState.session?.showingCorrectAnswer || gameState.session?.allPlayersAnswered) {
      if (!showingCorrectAnswer) {
        // If we haven't set our local state yet, set it
        setShowingCorrectAnswer(true);
      }
      
      // If we're showing the correct answer, wait 5 seconds then go to next question
      console.log("Showing correct answer, will auto-advance in 5 seconds");
      const timerId = setTimeout(() => {
        console.log("5 seconds elapsed, moving to next question");
        setShowingCorrectAnswer(false);
        nextQuestion();
      }, 5000);
      
      return () => clearTimeout(timerId);
    } else if (showingCorrectAnswer && !gameState.session?.showingCorrectAnswer) {
      // If we were showing but game state changed, reset our local state
      setShowingCorrectAnswer(false);
    }
  }, [nextQuestion, showingCorrectAnswer, gameState.session?.showingCorrectAnswer, gameState.session?.allPlayersAnswered]);
  
  // This effect manages the leaderboard timer between rounds
  useEffect(() => {
    if (gameState.session?.showLeaderboard && leaderboardTimer === null) {
      setLeaderboardTimer(10);
      
      const timerId = setInterval(() => {
        setLeaderboardTimer((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerId);
            nextQuestion(); // Move to next category/round
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timerId);
    }
    
    if (!gameState.session?.showLeaderboard) {
      setLeaderboardTimer(null);
    }
  }, [gameState.session?.showLeaderboard, nextQuestion, leaderboardTimer]);

  const handleTimerComplete = () => {
    if (gameState.session?.status === 'playing' && !showingCorrectAnswer) {
      // Show correct answer
      console.log("Timer completed, showing correct answer");
      setShowingCorrectAnswer(true);
      updateGameShowingCorrectAnswer(true);
    }
  };
  
  const updateGameShowingCorrectAnswer = (showing: boolean) => {
    if (!gameState.session) return;
    
    console.log("Updating game to show correct answer:", showing);
    const gameRef = ref(rtdb, `games/${gameState.session.id}`);
    update(gameRef, {
      showingCorrectAnswer: showing,
      allPlayersAnswered: true // Also set all players answered
    });
  };
  
  const renderMainContent = () => {
    if (!gameState.session) return null;
    
    if (gameState.session.showLeaderboard) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-4xl font-bold text-center mb-4">
            Leaderboard
          </h2>
          <p className="text-center text-xl mb-8">
            Round {gameState.session.currentRound + 1} completed!
            <br />
            Next category in {leaderboardTimer} seconds...
          </p>
          <div className="grid grid-cols-1 gap-4">
            {teams.sort((a, b) => b.score - a.score).map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">
                  #{index + 1}
                </div>
                <TeamCard team={team} isActive={index < 3} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }
    
    if (gameState.session.status === 'finished') {
      const winner = [...teams].sort((a, b) => b.score - a.score)[0];
      
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-4xl font-bold text-center mb-4">
            Game Over!
          </h2>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-blue-600 mb-2">Winner</h3>
            <p className="text-4xl">{winner?.name || 'No winner'}</p>
            <p className="text-2xl text-gray-600">{winner?.score || 0} points</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {teams.sort((a, b) => b.score - a.score).map((team, index) => (
              <TeamCard key={team.id} team={team} isActive={index === 0} />
            ))}
          </div>
        </motion.div>
      );
    }
    
    return (
      <>
        {currentQuestion && (
          <>
            <div className="mb-4">
              <Timer
                duration={30}
                onComplete={handleTimerComplete}
                isActive={gameState.session.status === 'playing' && !gameState.session.isPaused && !showingCorrectAnswer}
                skipTimer={gameState.session.allPlayersAnswered}
              />
            </div>
            <Question showCorrectAnswer={showingCorrectAnswer} />
          </>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {renderMainContent()}
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            <div className="space-y-4">
              {teams
                .sort((a, b) => b.score - a.score)
                .map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TeamCard team={team} isActive={index === 0} />
                  </motion.div>
                ))}
              
              {teams.length === 0 && (
                <p className="text-gray-500 text-center">No teams yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
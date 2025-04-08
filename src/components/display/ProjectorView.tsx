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
  const [showingAnswer, setShowingAnswer] = useState(false);
  
  // This effect checks if all players have answered to potentially skip the timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (gameState.session?.status === 'playing' && !showingAnswer) {
        checkAllPlayersAnswered();
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [checkAllPlayersAnswered, gameState.session?.status, showingAnswer]);
  
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
    if (!gameState.session || gameState.session.status !== 'playing' || showingAnswer) return;
    
    // Show correct answer
    setShowingAnswer(true);
    updateGameShowingCorrectAnswer(true);
    
    // Wait 3 seconds then move to next question
    setTimeout(() => {
      setShowingAnswer(false);
      nextQuestion();
    }, 3000);
  };
  
  const updateGameShowingCorrectAnswer = (showing: boolean) => {
    if (!gameState.session) return;
    
    const gameRef = ref(rtdb, `games/${gameState.session.id}`);
    update(gameRef, {
      showingCorrectAnswer: showing
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
            Runda {gameState.session.currentRound + 1} završena!
            <br />
            Sledeća kategorija za {leaderboardTimer} sekundi...
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
            Igra završena!
          </h2>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-blue-600 mb-2">Pobednik</h3>
            <p className="text-4xl">{winner?.name || 'Nema pobednika'}</p>
            <p className="text-2xl text-gray-600">{winner?.score || 0} poena</p>
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
            <div className="mb-6">
              <Timer
                duration={30}
                onComplete={handleTimerComplete}
                isActive={gameState.session.status === 'playing' && !gameState.session.isPaused}
                skipTimer={gameState.session.allPlayersAnswered}
              />
            </div>
            <Question showingCorrectAnswer={showingAnswer} />
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
                <p className="text-gray-500 text-center">Nema igrača još</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
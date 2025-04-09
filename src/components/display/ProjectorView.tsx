import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
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
  const [timerKey, setTimerKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset states when question changes
  useEffect(() => {
    setShowingCorrectAnswer(false);
    setIsTransitioning(false);
    setTimerKey(prev => prev + 1);
  }, [currentQuestion?.id]);

  // Handle timer completion and question transitions
  const handleTimerComplete = useCallback(() => {
    if (!gameState.session?.status === 'playing' || showingCorrectAnswer || isTransitioning) {
      return;
    }

    setShowingCorrectAnswer(true);
    setIsTransitioning(true);

    // Update game state in Firebase
    const gameRef = ref(rtdb, `games/${gameState.session?.id}`);
    update(gameRef, {
      showingCorrectAnswer: true,
      allPlayersAnswered: true
    });

    // Wait 3 seconds before moving to next question
    setTimeout(() => {
      setShowingCorrectAnswer(false);
      nextQuestion();
      setIsTransitioning(false);
    }, 3000);
  }, [gameState.session?.id, gameState.session?.status, showingCorrectAnswer, isTransitioning, nextQuestion]);

  // Handle leaderboard display between rounds
  useEffect(() => {
    if (gameState.session?.showLeaderboard && !leaderboardTimer) {
      setLeaderboardTimer(10);

      const timer = setInterval(() => {
        setLeaderboardTimer(prev => {
          if (!prev || prev <= 1) {
            clearInterval(timer);
            nextQuestion();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }

    if (!gameState.session?.showLeaderboard) {
      setLeaderboardTimer(null);
    }
  }, [gameState.session?.showLeaderboard, leaderboardTimer, nextQuestion]);

  // Render game content based on state
  const renderGameContent = () => {
    if (!currentQuestion) return null;

    return (
      <>
        <div className="mb-4">
          <Timer
            key={timerKey}
            duration={15}
            onComplete={handleTimerComplete}
            isActive={
              gameState.session?.status === 'playing' &&
              !showingCorrectAnswer &&
              !isTransitioning &&
              !gameState.session?.isPaused
            }
          />
        </div>
        <Question
          showCorrectAnswer={showingCorrectAnswer}
          showDebugInfo={false}
        />
      </>
    );
  };

  // Render leaderboard content
  const renderLeaderboardContent = () => {
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
          Round {gameState.session?.currentRound ?? 0 + 1} completed!
          <br />
          Next category in {leaderboardTimer} seconds...
        </p>
        <div className="grid grid-cols-1 gap-4">
          {teams
            .sort((a, b) => b.score - a.score)
            .map((team, index) => (
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
  };

  // Render game over content
  const renderGameOverContent = () => {
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
          {teams
            .sort((a, b) => b.score - a.score)
            .map((team, index) => (
              <TeamCard key={team.id} team={team} isActive={index === 0} />
            ))}
        </div>
      </motion.div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {!gameState.session ? null : 
              gameState.session.showLeaderboard ? renderLeaderboardContent() :
              gameState.session.status === 'finished' ? renderGameOverContent() :
              renderGameContent()
            }
          </div>

          {/* Side Leaderboard */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            <div className="space-y-4">
              {teams.length === 0 ? (
                <p className="text-gray-500 text-center">No teams yet</p>
              ) : (
                teams
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
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
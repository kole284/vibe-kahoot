import { motion } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { Question } from '../game/Question';
import { Timer } from '../game/Timer';
import { TeamCard } from '../game/TeamCard';
import { ref, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase/firebase';

const QUESTION_DURATION = 15;
const SHOW_ANSWER_DURATION = 3; // Duration in seconds

export function ProjectorView() {
  const { gameState, teams, currentQuestion, nextQuestion, checkAllPlayersAnswered } = useGame();
  const [leaderboardTimer, setLeaderboardTimer] = useState<number | null>(null);
  const [showingCorrectAnswer, setShowingCorrectAnswer] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const internalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const gameId = gameState.session?.id;
  const currentSessionState = gameState.session; // For easier access in useEffect dependencies

  // Reset state when question changes OR when game state indicates it
  useEffect(() => {
    if (currentSessionState && !currentSessionState.showingCorrectAnswer) {
      setShowingCorrectAnswer(false);
    }
    if (currentSessionState?.status !== 'playing' || currentSessionState?.isPaused) {
      setIsTransitioning(false); // Reset transition if game paused or not playing
    }
  }, [currentSessionState]);

  // --- Timer Control Logic --- 
  useEffect(() => {
    // Clear existing timers on cleanup or state change
    const cleanupTimers = () => {
      if (internalTimerRef.current) clearInterval(internalTimerRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      internalTimerRef.current = null;
      transitionTimeoutRef.current = null;
    };

    if (!gameId || !currentSessionState || currentSessionState.status !== 'playing' || 
        currentSessionState.isPaused || currentSessionState.showingCorrectAnswer || 
        currentSessionState.allPlayersAnswered) {
      cleanupTimers(); // Stop timer if game not active, paused, or answer shown/all answered
      return;
    }

    // Start the countdown timer only if it's not already running
    if (!internalTimerRef.current) {
      let localTimeLeft = currentSessionState.timeRemaining ?? QUESTION_DURATION;
      console.log("Starting internal timer with:", localTimeLeft);
      
      internalTimerRef.current = setInterval(() => {
        localTimeLeft -= 1;
        
        // Update Firebase timeRemaining
        const gameRef = ref(rtdb, `games/${gameId}`);
        update(gameRef, { timeRemaining: localTimeLeft });

        if (localTimeLeft <= 0) {
          console.log("Internal timer reached 0");
          cleanupTimers();
          // Firebase listener will trigger handleShowAnswer sequence via allPlayersAnswered/showingCorrectAnswer update
        } else {
          // Optional: Check if all players answered mid-interval
          // checkAllPlayersAnswered(); // Uncomment if needed, but might be too frequent
        }
      }, 1000);
    }

    return cleanupTimers; // Cleanup on unmount or dependency change

  }, [gameId, currentSessionState, checkAllPlayersAnswered]); // Dependencies trigger timer logic re-evaluation

  // --- Show Answer & Transition Logic --- 
  useEffect(() => {
    // This effect reacts to Firebase state changes for showing answer/all answered
    if (gameId && currentSessionState && (currentSessionState.showingCorrectAnswer || currentSessionState.allPlayersAnswered) && 
        !isTransitioning) {
          
      console.log("Detected showCorrectAnswer or allPlayersAnswered=true. Starting transition.", { 
        showing: currentSessionState.showingCorrectAnswer,
        allAnswered: currentSessionState.allPlayersAnswered
      });
          
      setIsTransitioning(true);
      setShowingCorrectAnswer(true); // Ensure local state reflects

      // Update Firebase if not already set (e.g., if triggered by allPlayersAnswered)
      if (!currentSessionState.showingCorrectAnswer) {
          const gameRef = ref(rtdb, `games/${gameId}`);
          update(gameRef, { showingCorrectAnswer: true });
      }

      // Clear any running countdown timer
      if (internalTimerRef.current) {
         clearInterval(internalTimerRef.current);
         internalTimerRef.current = null;
         console.log("Cleared internal timer due to transition start");
      }

      // Wait for SHOW_ANSWER_DURATION seconds before moving to next question
      transitionTimeoutRef.current = setTimeout(() => {
        console.log("Transition delay finished, calling nextQuestion");
        setIsTransitioning(false);
        // nextQuestion() will reset showingCorrectAnswer and allPlayersAnswered in Firebase
        nextQuestion(); 
      }, SHOW_ANSWER_DURATION * 1000);
    }

    // Cleanup timeout if dependencies change or component unmounts
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };

  }, [gameId, currentSessionState, isTransitioning, nextQuestion]);

  // Handle leaderboard display between rounds (simplified)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (currentSessionState?.showLeaderboard) {
      let leaderboardTime = 10; // Duration for leaderboard
      setLeaderboardTimer(leaderboardTime);
      timer = setInterval(() => {
        leaderboardTime--;
        setLeaderboardTimer(leaderboardTime);
        if (leaderboardTime <= 0) {
          if(timer) clearInterval(timer);
          nextQuestion();
        }
      }, 1000);
    } else {
      setLeaderboardTimer(null);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [currentSessionState?.showLeaderboard, nextQuestion]);

  // Render game content based on state
  const renderGameContent = () => {
    if (!currentQuestion) return <div className="text-center p-8">Loading Question...</div>;

    return (
      <>
        <div className="mb-4">
          <Timer
            duration={QUESTION_DURATION}
            timeLeft={currentSessionState?.timeRemaining ?? QUESTION_DURATION}
          />
        </div>
        <Question
          showCorrectAnswer={showingCorrectAnswer || !!currentSessionState?.showingCorrectAnswer}
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
          Round {currentSessionState?.currentRound ?? 0 + 1} completed!
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
            {!currentSessionState ? <div className="text-center p-8">Loading Game...</div> : 
              currentSessionState.showLeaderboard ? renderLeaderboardContent() :
              currentSessionState.status === 'finished' ? renderGameOverContent() :
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
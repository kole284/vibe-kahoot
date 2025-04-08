import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { Question } from '../game/Question';
import { Timer } from '../game/Timer';
import { TeamCard } from '../game/TeamCard';

export function ProjectorView() {
  const { gameState, teams, currentQuestion, nextQuestion } = useGame();

  const handleTimerComplete = () => {
    if (gameState.phase === 'question') {
      nextQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2">
            {gameState.phase === 'question' && currentQuestion && (
              <>
                <Timer
                  duration={30}
                  onComplete={handleTimerComplete}
                  isActive={gameState.status === 'active'}
                />
                <Question />
              </>
            )}

            {gameState.phase === 'results' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-lg p-8"
              >
                <h2 className="text-4xl font-bold text-center mb-8">
                  Results
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="col-span-1">
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
                      <TeamCard team={team} />
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
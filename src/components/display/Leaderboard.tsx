import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { TeamCard } from '../game/TeamCard';

export function Leaderboard() {
  const { teams } = useGame();

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 p-8"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Leaderboard</h1>

        <div className="grid gap-4">
          {sortedTeams.map((team, index) => (
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

        {teams.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 mt-8"
          >
            No teams have joined yet
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 
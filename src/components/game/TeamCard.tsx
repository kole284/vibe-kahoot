import { motion } from 'framer-motion';
import { Team } from '../../types';

interface TeamCardProps {
  team: Team;
  isActive?: boolean;
}

export function TeamCard({ team, isActive = false }: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg shadow-lg ${
        isActive ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">{team.name}</h3>
          <p className="text-gray-600">Table {team.tableNumber}</p>
        </div>
        <div className="text-2xl font-bold text-blue-600">
          {team.score} pts
        </div>
      </div>

      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(team.score / 1000) * 100}%` }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-2 text-center text-green-500 font-bold"
        >
          Active
        </motion.div>
      )}
    </motion.div>
  );
} 
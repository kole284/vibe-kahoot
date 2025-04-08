import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

export function Header() {
  const navigate = useNavigate();
  const { gameState, startGame, nextQuestion } = useGame();
  const session = gameState.session;

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/')}>FONIS Quiz</h1>
            <span className="text-gray-500">
              {session?.status === 'waiting' && 'Waiting for teams...'}
              {session?.status === 'playing' && 'Game in progress'}
              {session?.status === 'finished' && 'Game finished'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/create')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Game
            </button>

            {session?.status === 'waiting' && (
              <button
                onClick={startGame}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Start Game
              </button>
            )}

            {session?.status === 'playing' && !session.isPaused && (
              <button
                onClick={nextQuestion}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Next Question
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 
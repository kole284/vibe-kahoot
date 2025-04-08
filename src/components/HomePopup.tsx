import { useNavigate } from 'react-router-dom';

export function HomePopup() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-4">Welcome to FONIS Quiz</h2>
        <p className="text-gray-600 text-center mb-6">
          Create a new game or browse existing quizzes to play with your friends.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/create')}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create New Game
          </button>
          <button
            onClick={() => navigate('/browse')}
            className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Browse Quizzes
          </button>
        </div>
      </div>
    </div>
  );
} 
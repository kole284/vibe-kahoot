import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBS5gnw4eO8jqAaCW5cNeVTjhUFMXQC140",
  authDomain: "kahoot-clone-b8034.firebaseapp.com",
  databaseURL: "https://kahoot-clone-b8034-default-rtdb.firebaseio.com",
  projectId: "kahoot-clone-b8034",
  storageBucket: "kahoot-clone-b8034.firebasestorage.app",
  messagingSenderId: "486709016032",
  appId: "1:486709016032:web:699b6739bab04f22782785",
  measurementId: "G-JQVLMKD96K"
};
//easter egg
export function BasicTest() {
  const [log, setLog] = useState<string[]>([]);
  const [gamesList, setGamesList] = useState<any[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  const testConnection = async () => {
    try {
      addLog("Starting basic test...");
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      addLog("Firebase initialized");
      
      // Get database
      const db = getDatabase(app);
      addLog("Database reference created");
      
      // List all games
      try {
        addLog("Listing all games in database...");
        const gamesRef = ref(db, 'games');
        const snapshot = await get(gamesRef);
        
        if (snapshot.exists()) {
          const games: any[] = [];
          snapshot.forEach((childSnapshot) => {
            games.push({
              id: childSnapshot.key,
              data: childSnapshot.val()
            });
          });
          setGamesList(games);
          addLog(`Found ${games.length} games`);
        } else {
          addLog("No games found in the database");
        }
      } catch (error) {
        addLog(`Error listing games: ${(error as Error).message}`);
      }
      
      addLog("Basic test completed");
    } catch (error) {
      addLog(`Test failed: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Basic Connection Test</h1>
        
        <div className="mb-4">
          <button 
            onClick={testConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Run Test Again
          </button>
        </div>
        
        {gamesList.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Available Games:</h2>
            <div className="grid grid-cols-1 gap-2">
              {gamesList.map(game => (
                <div key={game.id} className="border rounded p-3 bg-gray-50">
                  <p className="font-medium">Game ID: {game.id}</p>
                  <p className="text-sm text-gray-600">Status: {game.data.status}</p>
                  <p className="text-sm text-gray-600">
                    Players: {game.data.players ? Object.keys(game.data.players).length : 0}
                  </p>
                  <div className="mt-2">
                    <a 
                      href={`/join/${game.id}`} 
                      className="text-xs text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Link
                    </a>
                    {' | '}
                    <a 
                      href={`/test-game/${game.id}`} 
                      className="text-xs text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Test Link
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Log:</h2>
          <div className="bg-black text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-96">
            {log.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
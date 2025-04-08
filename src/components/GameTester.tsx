import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Directly import Firebase config for testing
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

export function GameTester() {
  const { gameId } = useParams<{ gameId: string }>();
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  const runBasicTest = async () => {
    try {
      addLog("Starting basic Firebase connectivity test...");
      
      // Initialize Firebase directly
      const app = initializeApp(firebaseConfig);
      addLog("Firebase app initialized");
      
      // Test Database connection
      const db = getDatabase(app);
      addLog("Database reference created");
      
      // Test a simple read operation
      try {
        addLog("Testing database read...");
        const testRef = ref(db, 'test');
        const snapshot = await get(testRef);
        addLog(`Database read test ${snapshot.exists() ? 'succeeded' : 'completed (path empty)'}`);
      } catch (dbError) {
        addLog(`Database read error: ${(dbError as Error).message}`);
        setError(`Database read error: ${(dbError as Error).message}`);
      }
      
      // Test authentication
      try {
        addLog("Testing authentication...");
        const auth = getAuth(app);
        const userCred = await signInAnonymously(auth);
        addLog(`Authentication succeeded: ${userCred.user.uid}`);
      } catch (authError) {
        addLog(`Authentication error: ${(authError as Error).message}`);
        setError(`Authentication error: ${(authError as Error).message}`);
      }
      
      // If we have a gameId, test reading the specific game
      if (gameId) {
        try {
          addLog(`Testing read for game ${gameId}...`);
          const gameRef = ref(db, `games/${gameId}`);
          const snapshot = await get(gameRef);
          
          if (snapshot.exists()) {
            addLog("Game found!");
            setTestResult(snapshot.val());
          } else {
            addLog(`Game not found at path: games/${gameId}`);
            setError(`Game not found: ${gameId}`);
            
            // Try alternative locations
            const altPaths = [`game/${gameId}`, `sessions/${gameId}`, `gameSessions/${gameId}`];
            for (const path of altPaths) {
              addLog(`Trying alternative path: ${path}`);
              const altRef = ref(db, path);
              const altSnapshot = await get(altRef);
              if (altSnapshot.exists()) {
                addLog(`Game found at ${path}!`);
                setTestResult(altSnapshot.val());
                setError(null);
                break;
              }
            }
          }
        } catch (gameError) {
          addLog(`Game read error: ${(gameError as Error).message}`);
          setError(`Game read error: ${(gameError as Error).message}`);
        }
      }
      
      addLog("Basic test completed");
    } catch (e) {
      const error = e as Error;
      addLog(`Test failed: ${error.message}`);
      setError(`Test failed: ${error.message}`);
    }
  };

  useEffect(() => {
    runBasicTest();
  }, [gameId]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Firebase Connection Tester</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {testResult && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Test Result:</h2>
            <div className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
              <pre className="text-xs">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <button 
            onClick={runBasicTest}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Run Test Again
          </button>
        </div>
        
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
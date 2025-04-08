import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, get, onValue, off } from 'firebase/database';
import { rtdb, auth } from '../lib/firebase/firebase';
import { signInAnonymously } from 'firebase/auth';

export function GameTester() {
  const { gameId } = useParams<{ gameId: string }>();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [gameData, setGameData] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<string>('Not authenticated');

  // Helper to add debug messages
  const addDebugMessage = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  // Test Firebase Auth
  const testAuth = async () => {
    try {
      addDebugMessage('Testing anonymous authentication...');
      await signInAnonymously(auth);
      const user = auth.currentUser;
      setAuthStatus(`Authenticated as ${user?.uid}`);
      addDebugMessage(`Successfully authenticated as ${user?.uid}`);
      return true;
    } catch (error) {
      addDebugMessage(`Authentication error: ${(error as Error).message}`);
      setAuthStatus(`Auth failed: ${(error as Error).message}`);
      return false;
    }
  };

  // Test reading game data
  const testGameRead = async () => {
    if (!gameId) {
      addDebugMessage('No gameId provided');
      return;
    }

    try {
      addDebugMessage(`Testing read access to game: ${gameId}`);
      
      // Try without authentication first
      try {
        const gameRef = ref(rtdb, `games/${gameId}`);
        addDebugMessage(`Reading from path: games/${gameId}`);
        const snapshot = await get(gameRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setGameData(data);
          addDebugMessage('Successfully read game data without auth!');
          addDebugMessage(`Game status: ${data.status}, Players: ${data.players ? Object.keys(data.players).length : 0}`);
          return;
        } else {
          addDebugMessage('Game not found without auth. Trying with auth...');
        }
      } catch (error) {
        addDebugMessage(`Error reading game without auth: ${(error as Error).message}`);
      }
      
      // Try with authentication
      const isAuthenticated = await testAuth();
      if (isAuthenticated) {
        const gameRef = ref(rtdb, `games/${gameId}`);
        const snapshot = await get(gameRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setGameData(data);
          addDebugMessage('Successfully read game data with auth!');
          addDebugMessage(`Game status: ${data.status}, Players: ${data.players ? Object.keys(data.players).length : 0}`);
        } else {
          addDebugMessage('Game not found even with auth');
          
          // Try alternative paths
          const paths = [
            `game/${gameId}`,
            `sessions/${gameId}`,
            `gameSession/${gameId}`
          ];
          
          for (const path of paths) {
            try {
              addDebugMessage(`Trying alternative path: ${path}`);
              const altRef = ref(rtdb, path);
              const altSnapshot = await get(altRef);
              
              if (altSnapshot.exists()) {
                const data = altSnapshot.val();
                setGameData(data);
                addDebugMessage(`Found game at alternative path: ${path}`);
                addDebugMessage(`Game data: ${JSON.stringify(data, null, 2).substring(0, 100)}...`);
                return;
              }
            } catch (error) {
              addDebugMessage(`Error with path ${path}: ${(error as Error).message}`);
            }
          }
        }
      }
    } catch (error) {
      addDebugMessage(`General error: ${(error as Error).message}`);
    }
  };

  // Run tests on mount
  useEffect(() => {
    addDebugMessage(`Starting tests for gameId: ${gameId}`);
    testGameRead();
    
    // Setup real-time listener
    const gameRef = ref(rtdb, `games/${gameId}`);
    addDebugMessage('Setting up real-time listener');
    
    const unsubscribe = onValue(gameRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          addDebugMessage('Real-time update received!');
          setGameData(snapshot.val());
        }
      },
      (error) => {
        addDebugMessage(`Real-time listener error: ${error.message}`);
      }
    );
    
    return () => {
      off(gameRef);
    };
  }, [gameId]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Game Tester</h1>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Game ID: {gameId}</h2>
          <p className="text-sm text-gray-600">Auth Status: {authStatus}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <div className="flex space-x-2">
            <button 
              onClick={testAuth}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Auth
            </button>
            <button 
              onClick={testGameRead}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Game Read
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Game Data</h2>
          <div className="bg-gray-100 p-3 rounded overflow-auto max-h-60">
            <pre className="text-xs">{gameData ? JSON.stringify(gameData, null, 2) : 'No data'}</pre>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Debug Log</h2>
          <div className="bg-black text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-96">
            {debugInfo.map((message, i) => (
              <div key={i}>{message}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
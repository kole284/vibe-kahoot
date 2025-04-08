import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProjectorView } from './components/display/ProjectorView';
import { Leaderboard } from './components/display/Leaderboard';
import { QRScanner } from './components/game/QRScanner';
import { Question } from './components/game/Question';
import { CreateGame } from './components/CreateGame';
import { AdminDashboard } from './components/AdminDashboard';
import { JoinGame } from './components/JoinGame';
import { GameLobby } from './components/GameLobby';
import { GameTester } from './components/GameTester';

function App() {
  return (
    <Router>
      <GameProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<QRScanner onScan={() => {}} />} />
              <Route path="/display" element={<ProjectorView />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/play" element={<Question />} />
              <Route path="/create" element={<CreateGame />} />
              <Route path="/admin/:gameId" element={<AdminDashboard />} />
              <Route path="/join/:gameId" element={<JoinGame />} />
              <Route path="/game/:gameId/player/:playerId" element={<GameLobby />} />
              <Route path="/test-game/:gameId" element={<GameTester />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </GameProvider>
    </Router>
  );
}

export default App;

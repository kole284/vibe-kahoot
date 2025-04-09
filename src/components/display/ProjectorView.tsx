import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { Question } from '../game/Question';
import { Timer } from '../game/Timer';
import { TeamCard } from '../game/TeamCard';
import { ref, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase/firebase';
// Konstante
const QUESTION_DURATION = 15; // 15 sekundi za svako pitanje

export function ProjectorView() {
  const { gameState, teams, currentQuestion, nextQuestion, checkAllPlayersAnswered } = useGame();
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);
  const [showingCorrectAnswer, setShowingCorrectAnswer] = useState(false);
  const [leaderboardTimer, setLeaderboardTimer] = useState<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkPlayersIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const gameId = gameState.session?.id;
  const isGameActive = gameState.session?.status === 'playing' && !gameState.session?.isPaused;
  
  // Funkcija za ažuriranje vremena u Firebase-u
  const updateTimeInFirebase = (seconds: number) => {
    if (!gameId) return;
    
    const gameRef = ref(rtdb, `games/${gameId}`);
    update(gameRef, { timeRemaining: seconds });
  };

  // Funkcija za prikazivanje tačnog odgovora na 3 sekunde pre prelaska na sledeće pitanje
  const showCorrectAnswerAndProceed = () => {
    if (!gameId) return;
    
    // Očisti sve intervale
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (checkPlayersIntervalRef.current) {
      clearInterval(checkPlayersIntervalRef.current);
      checkPlayersIntervalRef.current = null;
    }
    
    setShowingCorrectAnswer(true);
    
    // Ažuriraj Firebase da pokazuje tačan odgovor
    const gameRef = ref(rtdb, `games/${gameId}`);
    update(gameRef, { 
      showingCorrectAnswer: true,
      timeRemaining: 0 // Osiguraj da je tajmer na 0
    });
    
    // Sačekaj 3 sekunde, pa pređi na sledeće pitanje
    setTimeout(() => {
      setShowingCorrectAnswer(false);
      nextQuestion();
    }, 3000);
  };

  // Glavni useEffect za tajmer
  useEffect(() => {
    // Reset tajmera i stanja kada se pitanje promeni ili igra pauzira/završi
    if (!isGameActive || !currentQuestion) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }
    
    // Postavi početno vreme
    setTimeLeft(QUESTION_DURATION);
    updateTimeInFirebase(QUESTION_DURATION);
    
    // Očisti prethodni interval ako postoji
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    // Pokreni novi interval za odbrojavanje
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        // Ažuriraj vreme u Firebase-u za sinhronizaciju sa igračima
        updateTimeInFirebase(newTime);
        
        // Proveri da li su svi igrači odgovorili
        if (gameState.session?.allPlayersAnswered) {
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          showCorrectAnswerAndProceed();
          return 0;
        }
        
        // Ako je vreme isteklo, prikaži tačan odgovor i pređi na sledeće pitanje
        if (newTime <= 0) {
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          showCorrectAnswerAndProceed();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
    
    // Očisti interval kada se komponenta unmount-uje ili pitanje promeni
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [currentQuestion?.id, isGameActive, gameState.session?.allPlayersAnswered]);
  
  // Effect za prikazivanje rezultata između rundi
  useEffect(() => {
    if (gameState.session?.showLeaderboard && leaderboardTimer === null) {
      setLeaderboardTimer(10);
      
      const interval = setInterval(() => {
        setLeaderboardTimer(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            nextQuestion();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
    
    if (!gameState.session?.showLeaderboard) {
      setLeaderboardTimer(null);
    }
  }, [gameState.session?.showLeaderboard, leaderboardTimer, nextQuestion]);

  // Effect za proveru da li su svi igrači odgovorili (nezavisno od tajmera)
  useEffect(() => {
    // Pokreni proveru igrača na svakih 500ms
    if (isGameActive && !showingCorrectAnswer) {
      checkPlayersIntervalRef.current = setInterval(() => {
        checkAllPlayersAnswered();
      }, 500);
    }
    
    return () => {
      if (checkPlayersIntervalRef.current) {
        clearInterval(checkPlayersIntervalRef.current);
        checkPlayersIntervalRef.current = null;
      }
    };
  }, [isGameActive, showingCorrectAnswer, checkAllPlayersAnswered]);

  // Render glavnog sadržaja (pitanja ili rezultata)
  const renderMainContent = () => {
    if (!gameState.session) return null;
    
    // Prikazi tabelu rezultata između rundi
    if (gameState.session.showLeaderboard) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-4xl font-bold text-center mb-4">
            Rezultati
          </h2>
          <p className="text-center text-xl mb-8">
            Runda {gameState.session.currentRound + 1} završena!
            <br />
            Sledeća kategorija za {leaderboardTimer} sekundi...
          </p>
          <div className="grid grid-cols-1 gap-4">
            {teams.sort((a, b) => b.score - a.score).map((team, index) => (
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
    }
    
    // Kraj igre
    if (gameState.session.status === 'finished') {
      const winner = [...teams].sort((a, b) => b.score - a.score)[0];
      
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-4xl font-bold text-center mb-4">
            Kraj igre!
          </h2>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-blue-600 mb-2">Pobednik</h3>
            <p className="text-4xl">{winner?.name || 'Nema pobednika'}</p>
            <p className="text-2xl text-gray-600">{winner?.score || 0} poena</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {teams.sort((a, b) => b.score - a.score).map((team, index) => (
              <TeamCard key={team.id} team={team} isActive={index === 0} />
            ))}
          </div>
        </motion.div>
      );
    }
    
    // Prikazi trenutno pitanje
    return (
      <>
        {currentQuestion && (
          <>
            <div className="mb-4">
              <Timer timeLeft={timeLeft} duration={QUESTION_DURATION} />
            </div>
            <Question showCorrectAnswer={showingCorrectAnswer} />
          </>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Glavni sadržaj */}
          <div className="md:col-span-2">
            {renderMainContent()}
          </div>

          {/* Tabela rezultata */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Rezultati</h2>
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
                    <TeamCard team={team} isActive={index === 0} />
                  </motion.div>
                ))}
              
              {teams.length === 0 && (
                <p className="text-gray-500 text-center">Nema timova</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
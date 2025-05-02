"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import HostControls from "../../components/HostControls";
import Scoreboard from "../../components/Scoreboard";
import QuestionScreen from "../../components/QuestionScreen";
import ResultsScreen from "../../components/ResultsScreen";

interface Scores {
  team1: number;
  team2: number;
}

interface Question {
  id?: string;
  text: string;
  correctAnswer: string;
  wrongAnswers: string[];
  points: number;
}

export default function Game() {
  const [playerName, setPlayerName] = useState('');
  const [playerTeam, setPlayerTeam] = useState<'team1' | 'team2' | null>(null);
  const [players, setPlayers] = useState<
    { name: string; team: 'team1' | 'team2'; isHost: boolean }[]
  >([]);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [gameState, setGameState] = useState<"scoreboard" | "question" | "results">("scoreboard");
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0 });
  const [question, setQuestion] = useState<Question | null>(null);
  const [results, setResults] = useState<Scores | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('playerName');
    const team = localStorage.getItem('playerTeam') as 'team1' | 'team2';
    if (!name || !team) {
      window.location.href = "/join";
      return;
    }
    setPlayerName(name);
    setPlayerTeam(team);

    const s = io("trivia-production-46ad.up.railway.app", {

        transports: ['websocket'], // optional but recommended for production
      });
      
    setSocket(s);
    s.emit("joinGame", { name, team });

    s.on('playerList', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    s.on("hostAssigned", (flag: boolean) => setIsHost(flag));

    s.on("gameState", ({ state, payload }: { state: "scoreboard" | "question" | "results"; payload: Scores | Question }) => {
      setGameState(state);
      if (state === "scoreboard") setScores(payload as Scores);
      if (state === "question") setQuestion(payload as Question);
      if (state === "results") setResults(payload as Scores);
    });

    s.on("scoreUpdate", (newScores: Scores) => setScores(newScores));

    return () => {
      s.disconnect();
    };
  }, []);

  if (!socket) return <p>Loading game…</p>;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 space-y-3">


      {gameState === "scoreboard" && (
        <div className="text-center">
          {playerTeam && (
            <h3 className="text-xl font-bold mb-4">
              You are on <span className="text-blue-600">{playerTeam}</span>
            </h3>
          )}

          <div className="flex justify-center gap-8">
            <div>
              <h4 className="font-semibold mb-2">Team 1</h4>
              <ul>
                {[...new Set(players
                  .filter(p => p.team === 'team1' && p.name.toLowerCase() !== 'wilsonqiu')
                  .map(p => p.name)
                )].map(name => (
                  <li key={`team1-${name}`} className={name === playerName ? 'font-bold' : ''}>
                    {name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Team 2</h4>
              <ul>
                {[...new Set(players
                  .filter(p => p.team === 'team2' && p.name.toLowerCase() !== 'wilsonqiu')
                  .map(p => p.name)
                )].map(name => (
                  <li key={`team2-${name}`} className={name === playerName ? 'font-bold' : ''}>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
        

      {isHost && socket && (
        <HostControls
          onStart={() => socket.emit("startGame")}
          onNext={() => socket.emit("nextQuestion")}
          onBack={() => socket.emit("prevQuestion")}
          onSkip={() => socket.emit("skipQuestion")}
          onAdjustPoints={(team: 'team1' | 'team2', pts: number) =>
            socket.emit("editPoints", { team, points: pts })}
        />
      )}

      
      {gameState === "question" && question && (
        <QuestionScreen socket={socket} question={question} />
      )}
      {gameState === "results" && results && (
        <ResultsScreen results={results} />
      )}
      {<Scoreboard scores={scores} />}

    </main>
  );
}

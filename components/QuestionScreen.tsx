"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface Question {
  text: string;
  correctAnswer: string;
  wrongAnswers: string[];
  points: number;
}

interface QuestionScreenProps {
  socket: Socket;
  question: Question;
}

export default function QuestionScreen({ socket, question }: QuestionScreenProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [canAnswer, setCanAnswer] = useState(false);
  const [buzzedIn, setBuzzedIn] = useState(false);
  const [timer, setTimer] = useState<number>(0);
  const [buzzInfo, setBuzzInfo] = useState<{ name: string | null; team: string | null }>({ name: null, team: null });
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  useEffect(() => {
    // When a new question is received, randomize options
    const all = [...question.wrongAnswers, question.correctAnswer];
    setOptions(all.sort(() => Math.random() - 0.5));
    setResult(null);
  }, [question]);
  

  useEffect(() => {
    
    // Listen for events from server
    const handlePromptAnswer = ({ time }: { time: number }) => {
      setCanAnswer(true);
      setBuzzedIn(true);
      setTimer(time);
    };

    const handleBuzzLocked = () => {
      setCanAnswer(false);
      setBuzzedIn(true);
    };

    const handleShowBuzzInfo = ({ name, team }: { name: string | null; team: string | null }) => {
      setBuzzInfo({ name, team });
    };

    const handleAnswerResult = ({ correct, player }: { correct: boolean; player: string | null }) => {
      setResult(correct ? "correct" : "incorrect");
      // setBuzzinfo player to the player without changing the team
      setBuzzInfo((prev) => ({ ...prev, name: player }));
      setCanAnswer(false);
      setBuzzedIn(true);
    };
    
    
    
    
    
    
    

    const handleGameState = ({ state }: { state: string }) => {
      if (state === "question") {
        setBuzzedIn(false);
        setCanAnswer(false);
        setResult(null);
        setTimer(0);
      }
    };
    
    

    socket.on("promptAnswer", handlePromptAnswer);
    socket.on("buzzLocked", handleBuzzLocked);
    socket.on("showBuzzInfo", handleShowBuzzInfo);
    socket.on("answerResult", handleAnswerResult);
    socket.on("gameState", handleGameState);

    return () => {
      socket.off("promptAnswer", handlePromptAnswer);
      socket.off("buzzLocked", handleBuzzLocked);
      socket.off("showBuzzInfo", handleShowBuzzInfo);
      socket.off("answerResult", handleAnswerResult);
      socket.off("gameState", handleGameState);
    };
  }, [socket]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const handleBuzz = () => {
    socket.emit("buzz");
    setBuzzedIn(true);
  };

  const submitAnswer = (selected: string) => {
    if (!canAnswer) return;
    socket.emit("submitAnswer", selected);
    setCanAnswer(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 bg-[var(--background)] text-[var(--foreground)]">
      <h2 className="text-3xl font-bold text-center">
        {question.text}{" "}
        <span className="text-xl font-medium text-blue-500">(+{question.points} pts)</span>
      </h2>


      {result === 'correct' && (
  <p className="text-2xl font-bold text-green-500">
    ✅ {buzzInfo.name} {buzzInfo.team} answered correctly!
  </p>
)}

{buzzInfo.team && result !== 'correct' && buzzedIn && ( 
  <p className="text-lg">
    {buzzInfo.name ? (
      <>🎯 <strong>{buzzInfo.name}</strong> from <strong>{buzzInfo.team}</strong> is answering!</>
    ) : (
      <>🎯 Now <strong>{buzzInfo.team}</strong> can answer!</>
    )}
  </p>
)}


      

      {timer > 0 && canAnswer && (
        <p className="text-2xl font-semibold">⏳ {timer}s</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full">
        {options.map((option, idx) => (
          <button
            key={idx}
            className={`px-4 py-3 rounded-lg text-white transition ${
              canAnswer ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={() => submitAnswer(option)}
            disabled={!canAnswer}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Buzz button only visible if player has not buzzed yet and can't answer yet */}
      {!canAnswer && !buzzedIn && (
        <div className="max-w-xl w-full">
        <button
          onClick={handleBuzz}
          className="mt-6 w-full py-6 text-3xl bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md animate-pulse"
        >
          🛎️ Buzz In!
        </button>
      </div>
      
      
      )}

      {result === "correct" && (
        <p className="text-green-500 font-bold text-2xl">✅ Correct!</p>
      )}
      {result === "incorrect" && !canAnswer &&(
        <p className="text-red-500 font-bold text-2xl">❌ Incorrect!</p>
      )}
    </div>
  );
}

"use client";

import React from "react";

interface ResultsProps {
  results: {
    team1: number;
    team2: number;
  };
}

export default function ResultsScreen({ results }: ResultsProps) {
  const winner =
    results.team1 > results.team2
      ? "team1"
      : results.team2 > results.team1
      ? "team2"
      : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8 bg-[var(--background)] text-[var(--foreground)]">
      <h2 className="text-5xl font-bold text-center">🎉 Game Over!</h2>

      <div className="text-3xl font-semibold text-center">
        {winner ? (
          <>
            🏆{" "}
            <span
              className={
                winner === "team1"
                  ? "text-blue-400 animate-pulse"
                  : "text-red-400 animate-pulse"
              }
            >
              {winner === "team1" ? "Team 1" : "Team 2"}
            </span>{" "}
            Wins!
          </>
        ) : (
          <>🤝 It’s a Tie!</>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-md w-full">
        <div
          className={`p-4 rounded-lg shadow-md border-2 ${
            winner === "team1"
              ? "border-blue-400 bg-blue-800/20"
              : "border-gray-500 bg-gray-800/30"
          }`}
        >
          <h4 className="text-xl font-bold text-blue-300 text-center">🔵 Team 1</h4>
          <p className="text-center text-3xl font-extrabold">{results.team1}</p>
        </div>

        <div
          className={`p-4 rounded-lg shadow-md border-2 ${
            winner === "team2"
              ? "border-red-400 bg-red-800/20"
              : "border-gray-500 bg-gray-800/30"
          }`}
        >
          <h4 className="text-xl font-bold text-red-300 text-center">🔴 Team 2</h4>
          <p className="text-center text-3xl font-extrabold">{results.team2}</p>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4">Thanks for playing!</p>
    </div>
  );
}

import React from "react";

interface Scores {
  team1: number;
  team2: number;
}

export default function Scoreboard({ scores }: { scores: Scores }) {
  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-md p-4 text-white mb-4">
      <h3 className="text-2xl font-bold text-center mb-3">🏆 Scoreboard</h3>
      <div className="flex justify-around items-center">
        <div className="text-center">
          <p className="text-lg font-semibold">🔵 Team 1</p>
          <p className="text-3xl font-extrabold text-blue-400">{scores.team1}</p>
        </div>
        <div className="border-l border-gray-600 h-10" />
        <div className="text-center">
          <p className="text-lg font-semibold">🔴 Team 2</p>
          <p className="text-3xl font-extrabold text-red-400">{scores.team2}</p>
        </div>
      </div>
    </div>
  );
}

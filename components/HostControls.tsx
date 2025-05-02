"use client";

import React, { useState } from "react";

interface HostControlsProps {
  onStart: () => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onAdjustPoints: (team: "team1" | "team2", pts: number) => void;
}

const HostControls = ({
  onStart,
  onNext,
  onBack,
  onSkip,
  onAdjustPoints,
}: HostControlsProps) => {
  const [team1Points, setTeam1Points] = useState<number>(0);
  const [team2Points, setTeam2Points] = useState<number>(0);

  const handlePointsUpdate = () => {
    onAdjustPoints("team1", team1Points);
    onAdjustPoints("team2", team2Points);
  };

  return (
    <div className="p-4 space-y-6 border rounded shadow bg-white text-black max-w-xl mx-auto mt-4">
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onStart}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Start Game
        </button>
        <button
          onClick={onBack}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Next
        </button>
        <button
          onClick={onSkip}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          Skip
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
        <div className="flex flex-col items-center">
          <label className="mb-1 font-semibold">Team 1 Points</label>
          <input
            type="number"
            value={team1Points}
            onChange={(e) => setTeam1Points(Number(e.target.value))}
            className="border px-2 py-1 rounded w-24 text-center"
          />
        </div>
        <div className="flex flex-col items-center">
          <label className="mb-1 font-semibold">Team 2 Points</label>
          <input
            type="number"
            value={team2Points}
            onChange={(e) => setTeam2Points(Number(e.target.value))}
            className="border px-2 py-1 rounded w-24 text-center"
          />
        </div>
        <button
          onClick={handlePointsUpdate}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition mt-4 sm:mt-0"
        >
          Update Points
        </button>
      </div>
    </div>
  );
};

export default HostControls;

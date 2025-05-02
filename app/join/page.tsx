"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Join() {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('team1');
  const router = useRouter();

  function handleSubmit(e :React.FormEvent) {
    e.preventDefault();
    // 1) Save to localStorage
    localStorage.setItem('playerName', name.trim());
    localStorage.setItem('playerTeam', team);
    // 2) Go to game page
    router.push('/game');
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: 'auto', padding: 20 }}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your Name"
        required
        className="border rounded w-full mb-2 px-2 py-1"
      />
      <select
        value={team}
        onChange={e => setTeam(e.target.value)}
        className="border rounded w-full mb-4 px-2 py-1"
      >
        <option value="team1">Team 1</option>
        <option value="team2">Team 2</option>
      </select>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
        Join Game
      </button>
    </form>
  );
}

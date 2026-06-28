import { useState } from 'react';
import { submitScore, fetchTopScores } from '../lib/leaderboard';
import type { GameResult, LeaderboardEntry } from '../types/game';
import { COMMANDER_RANKS } from '../game/constants';

interface Props {
  result: GameResult;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function EndScreen({ result, onPlayAgain, onMenu }: Props) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);

  const rankData = [...COMMANDER_RANKS].reverse().find(r => result.score >= r.min) ?? COMMANDER_RANKS[0];

  const historical = result.won
    ? `You successfully defended Charleston Harbor. Colonel Moultrie would be proud.`
    : `The fort has fallen. But history remembers every defender who stood their ground.`;

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Enter your name'); return; }
    setSubmitting(true);
    setError('');
    const { error: err } = await submitScore(name, result);
    if (err) { setError(err); setSubmitting(false); return; }
    const scores = await fetchTopScores(8);
    setTopScores(scores);
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-y-auto py-8"
      style={{
        background: result.won
          ? 'radial-gradient(ellipse at center, #0a2a0a 0%, #030c03 100%)'
          : 'radial-gradient(ellipse at center, #2a0a0a 0%, #0c0303 100%)',
      }}
    >
      <div className="w-full max-w-2xl mx-4" style={{ fontFamily: 'Georgia, serif' }}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="text-5xl font-bold mb-2"
            style={{ color: result.won ? '#70e870' : '#ee4444' }}
          >
            {result.won ? 'HARBOR DEFENDED!' : 'FORT HAS FALLEN'}
          </h1>
          <p className="text-amber-300/80 text-lg italic">{historical}</p>
          <div className="mt-3 px-4 py-2 inline-block border border-amber-600/50 bg-amber-900/20">
            <span className="text-amber-400 text-xl font-bold">{rankData.rank}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Final Score', value: result.score.toLocaleString(), highlight: true },
            { label: 'Wave Reached', value: `${result.waveReached} / 5` },
            { label: 'Shot Accuracy', value: `${result.accuracy}%` },
            { label: 'Ships Destroyed', value: result.shipsDestroyed },
            { label: 'Crew Saved', value: `${result.crewSaved}%` },
            { label: 'Commander Rank', value: rankData.rank },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`px-4 py-3 border ${highlight ? 'border-amber-400/60 bg-amber-900/30' : 'border-amber-800/40 bg-black/30'}`}
            >
              <div className="text-amber-500/70 text-xs tracking-widest uppercase mb-1">{label}</div>
              <div className={`font-bold text-xl ${highlight ? 'text-amber-300' : 'text-amber-200/80'}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Submit score */}
        {!submitted ? (
          <div className="border border-amber-700/50 bg-black/40 p-4 mb-4">
            <p className="text-amber-400/80 text-sm mb-3 text-center">Submit your score to the leaderboard</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value.slice(0, 20))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Your name (max 20 chars)"
                className="flex-1 px-3 py-2 bg-stone-900/80 border border-amber-700/40 text-amber-200 placeholder-amber-700/50 text-sm outline-none focus:border-amber-500/70"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 bg-amber-800/70 border border-amber-600/60 text-amber-200 text-sm
                  hover:bg-amber-700/80 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        ) : (
          <div className="border border-amber-700/50 bg-black/40 p-4 mb-4">
            <p className="text-green-400/80 text-sm text-center mb-3">Score submitted! Top scores:</p>
            <div className="space-y-1">
              {topScores.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="text-amber-600/60 w-5 text-right">{i + 1}.</span>
                  <span className="text-amber-300/90 flex-1 truncate">{s.player_name}</span>
                  <span className="text-amber-200 font-bold">{s.score.toLocaleString()}</span>
                  <span className="text-amber-600/60 text-xs">{s.commander_rank}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onPlayAgain}
            className="px-8 py-3 bg-amber-900/80 border border-amber-500/70 text-amber-200 font-bold
              hover:bg-amber-700/90 hover:border-amber-300 hover:scale-105 transition-all"
          >
            Play Again
          </button>
          <button
            onClick={onMenu}
            className="px-8 py-3 bg-stone-900/70 border border-amber-700/50 text-amber-300/80
              hover:bg-stone-800/80 hover:border-amber-500/70 transition-all"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

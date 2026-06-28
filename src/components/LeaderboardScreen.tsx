import { useEffect, useState } from 'react';
import { fetchTopScores } from '../lib/leaderboard';
import type { LeaderboardEntry } from '../types/game';

interface Props {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: Props) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopScores(20).then(s => { setScores(s); setLoading(false); });
  }, []);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center py-10 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at top, #1a1208 0%, #060402 100%)', fontFamily: 'Georgia, serif' }}
    >
      <div className="w-full max-w-xl mx-4">
        <h1 className="text-4xl font-bold text-center text-amber-300 mb-1">Leaderboard</h1>
        <p className="text-amber-600/60 text-center text-sm mb-6 tracking-widest">Fort Sullivan — Harbor Defender</p>

        <div className="border border-amber-700/40 bg-black/50 overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-amber-900/20 border-b border-amber-700/30 text-amber-500/70 text-xs uppercase tracking-wider">
            <span>#</span>
            <span className="col-span-2">Commander</span>
            <span className="text-right">Score</span>
            <span className="text-right">Wave</span>
          </div>

          {loading && (
            <div className="py-12 text-center text-amber-600/60">Loading...</div>
          )}

          {!loading && scores.length === 0 && (
            <div className="py-12 text-center text-amber-600/60">
              No scores yet — be the first to defend the harbor!
            </div>
          )}

          {scores.map((s, i) => (
            <div
              key={s.id}
              className={`grid grid-cols-5 gap-2 px-4 py-3 border-b border-amber-900/30
                ${i === 0 ? 'bg-amber-900/15' : 'hover:bg-amber-900/10'} transition-colors`}
            >
              <span className={`font-bold ${i === 0 ? 'text-amber-300' : i <= 2 ? 'text-amber-400/70' : 'text-amber-600/50'}`}>
                {i + 1}
              </span>
              <span className="col-span-2">
                <span className="text-amber-200/90 truncate block">{s.player_name}</span>
                <span className="text-amber-600/50 text-xs">{s.commander_rank}</span>
              </span>
              <span className="text-amber-200 font-bold text-right">{s.score.toLocaleString()}</span>
              <span className="text-amber-500/70 text-right">{s.wave_reached}/5</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="px-8 py-3 border border-amber-700/50 text-amber-300/80 bg-stone-900/70
              hover:bg-stone-800/80 hover:border-amber-500/70 transition-all"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

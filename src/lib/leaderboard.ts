import { supabase } from './supabase';
import type { GameResult, LeaderboardEntry } from '../types/game';

export async function submitScore(
  playerName: string,
  result: GameResult
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Leaderboard is offline.' };
  const { error } = await supabase.from('scores').insert({
    player_name: playerName.trim().slice(0, 20) || 'Anonymous',
    score: result.score,
    accuracy: parseFloat(result.accuracy.toFixed(2)),
    ships_destroyed: result.shipsDestroyed,
    crew_saved: parseFloat(result.crewSaved.toFixed(2)),
    wave_reached: result.waveReached,
    commander_rank: result.commanderRank,
  });
  return { error: error ? error.message : null };
}

export async function fetchTopScores(limit = 10): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as LeaderboardEntry[];
}

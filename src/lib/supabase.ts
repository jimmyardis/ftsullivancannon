import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// When the Supabase env vars are absent (e.g. a static GitHub Pages build with
// no backend configured), we skip client creation entirely. createClient throws
// on an empty URL, which would white-screen the whole game — so instead the
// leaderboard simply goes offline and the rest of the game runs normally.
export const isLeaderboardEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isLeaderboardEnabled
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

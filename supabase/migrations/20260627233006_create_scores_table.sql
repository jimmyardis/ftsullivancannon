/*
# Create scores table for Fort Sullivan leaderboard

A single-tenant, no-auth leaderboard. Any visitor can submit a score and read
the global top scores. No sign-in required.

## New Tables
- `scores`
  - `id`              uuid PRIMARY KEY
  - `player_name`     text (displayed on leaderboard, max 20 chars)
  - `score`           integer (raw game score)
  - `accuracy`        numeric(5,2) (shot accuracy as percentage 0–100)
  - `ships_destroyed` integer
  - `crew_saved`      numeric(5,2) (percentage of crew that survived 0–100)
  - `wave_reached`    integer (1–5)
  - `commander_rank`  text (title awarded at end of game)
  - `created_at`      timestamptz

## Security
- RLS enabled.
- `anon` and `authenticated` roles can SELECT (read leaderboard).
- `anon` and `authenticated` roles can INSERT (submit scores).
- No UPDATE or DELETE (scores are immutable once submitted).

## Notes
- No `user_id` or auth dependency — this is an open public leaderboard.
- `USING (true)` on SELECT/INSERT policies is intentional: all score data is
  meant to be publicly visible.
*/

CREATE TABLE IF NOT EXISTS scores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name     text NOT NULL DEFAULT 'Anonymous',
  score           integer NOT NULL DEFAULT 0,
  accuracy        numeric(5,2) NOT NULL DEFAULT 0,
  ships_destroyed integer NOT NULL DEFAULT 0,
  crew_saved      numeric(5,2) NOT NULL DEFAULT 100,
  wave_reached    integer NOT NULL DEFAULT 1,
  commander_rank  text NOT NULL DEFAULT 'Powder Monkey',
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scores" ON scores;
CREATE POLICY "anon_select_scores" ON scores FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scores" ON scores;
CREATE POLICY "anon_insert_scores" ON scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);

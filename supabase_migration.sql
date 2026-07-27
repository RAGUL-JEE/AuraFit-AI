-- ============================================================
-- AI GYM COACH — Supabase Database Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. USERS TABLE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
 id uuid primary key references auth.users(id),
 name text,
 email text unique,
 created_at timestamptz default now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);


-- ─────────────────────────────────────────────
-- 2. WORKOUTS TABLE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.workouts (
 id bigint generated always as identity primary key,
 user_id uuid references public.users(id) ON DELETE CASCADE,
 workout_name text,
 reps integer,
 sets integer,
 calories integer,
 duration integer,
 accuracy numeric(4,1),
 created_at timestamptz default now()
);

-- Enable Row Level Security
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts
DROP POLICY IF EXISTS "Users can read own workouts" ON public.workouts;
CREATE POLICY "Users can read own workouts" 
  ON public.workouts FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workouts" ON public.workouts;
CREATE POLICY "Users can insert own workouts" 
  ON public.workouts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_created_at_idx ON public.workouts(created_at DESC);

-- ─────────────────────────────────────────────
-- 3. PROFILES TABLE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
 id uuid primary key references auth.users(id) ON DELETE CASCADE,
 full_name text,
 username text,
 email text,
 phone_number text,
 location text,
 age integer,
 weight numeric,
 height numeric,
 body_fat numeric,
 fitness_goal text,
 bio text,
 avatar_url text,
 joined_date text,
 camera_enabled boolean default true,
 audio_feedback boolean default true,
 dark_mode boolean default false,
 notifications boolean default true,
 data_sync boolean default true,
 ai_sensitivity text default 'High',
 updated_at timestamptz default now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ─────────────────────────────────────────────
-- 4. WORKOUT SESSIONS TABLE
--    Used by the mobile app (useWorkoutHistory) and readable by
--    the website for shared workout history across both platforms.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) ON DELETE CASCADE not null,
  workout_name text,
  exercise_name text,
  exercise_id text,
  reps integer default 0,
  correct_reps integer default 0,
  incorrect_reps integer default 0,
  sets integer default 0,
  calories integer default 0,
  duration integer default 0,
  duration_seconds integer default 0,
  accuracy numeric(5,2) default 0,
  status text default 'completed',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_sessions
DROP POLICY IF EXISTS "Users can read own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can read own workout sessions"
  ON public.workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can insert own workout sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can delete own workout sessions"
  ON public.workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS workout_sessions_user_id_idx ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS workout_sessions_created_at_idx ON public.workout_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS workout_sessions_exercise_id_idx ON public.workout_sessions(exercise_id);


-- ─────────────────────────────────────────────
-- 5. FAVORITES TABLE
--    Shared between Web App and Mobile App.
--    Both platforms read/write to this table using the same user_id.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) ON DELETE CASCADE not null,
  workout_id text not null,
  created_at timestamptz default now(),
  UNIQUE(user_id, workout_id)
);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own favorites" ON public.favorites;
CREATE POLICY "Users can read own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_workout_id_idx ON public.favorites(workout_id);


-- ─────────────────────────────────────────────
-- 6. ENABLE SUPABASE REALTIME
--    Run this after creating the tables.
--    Enables live sync between Web App and Mobile App.
-- ─────────────────────────────────────────────

-- Enable realtime for cross-platform sync tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;


-- ─────────────────────────────────────────────
-- 7. UPDATE RLS ON profiles TO ALLOW UPDATE
--    (ensure upsert works from both platforms)
-- ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ─────────────────────────────────────────────
-- 8. SCHEDULED WORKOUTS TABLE
--    Shared between Web App and Mobile App.
--    Each row = one workout assigned to a day of the week
--    for a specific user. Syncs in real-time across platforms.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.scheduled_workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) ON DELETE CASCADE not null,
  workout_id text not null,
  workout_name text not null,
  scheduled_day text not null,
  created_at timestamptz default now(),
  UNIQUE(user_id, workout_id, scheduled_day)
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own scheduled workouts" ON public.scheduled_workouts;
CREATE POLICY "Users can read own scheduled workouts"
  ON public.scheduled_workouts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own scheduled workouts" ON public.scheduled_workouts;
CREATE POLICY "Users can insert own scheduled workouts"
  ON public.scheduled_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own scheduled workouts" ON public.scheduled_workouts;
CREATE POLICY "Users can delete own scheduled workouts"
  ON public.scheduled_workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS scheduled_workouts_user_id_idx ON public.scheduled_workouts(user_id);
CREATE INDEX IF NOT EXISTS scheduled_workouts_day_idx ON public.scheduled_workouts(user_id, scheduled_day);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_workouts;


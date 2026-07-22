-- ============================================================
-- SQL Migration: Update workout_sessions table schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add missing columns
ALTER TABLE public.workout_sessions
ADD COLUMN IF NOT EXISTS workout_name text,
ADD COLUMN IF NOT EXISTS exercise_name text,
ADD COLUMN IF NOT EXISTS correct_reps integer default 0,
ADD COLUMN IF NOT EXISTS incorrect_reps integer default 0,
ADD COLUMN IF NOT EXISTS duration integer default 0,
ADD COLUMN IF NOT EXISTS status text default 'completed',
ADD COLUMN IF NOT EXISTS started_at timestamptz,
ADD COLUMN IF NOT EXISTS completed_at timestamptz,
ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- 2. Migrate existing data for continuity
UPDATE public.workout_sessions
SET 
  exercise_name = COALESCE(exercise_name, exercise_id),
  duration = COALESCE(NULLIF(duration, 0), duration_seconds),
  correct_reps = COALESCE(NULLIF(correct_reps, 0), reps),
  incorrect_reps = COALESCE(incorrect_reps, 0);

-- Note: We are keeping exercise_id and duration_seconds for backwards 
-- compatibility temporarily, but all new inserts will use the new columns.

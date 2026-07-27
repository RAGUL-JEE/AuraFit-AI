-- Execute this script in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_calories NUMERIC DEFAULT 0,
  workouts_completed INTEGER DEFAULT 0,
  average_accuracy NUMERIC DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own progress
CREATE POLICY "Users can view own progress" 
ON public.user_progress FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert/update their own progress (since the backend might use the user's token or anon key)
CREATE POLICY "Users can insert own progress" 
ON public.user_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
ON public.user_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable Realtime for user_progress table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;

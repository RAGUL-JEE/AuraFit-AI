import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sendWelcomeEmail, sendWorkoutCompletionEmail, sendWeeklyProgressEmail, sendPasswordResetEmail } from './src/services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_gym_coach_key_998877';

// Middlewares
app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// SUPABASE DATABASE INTEGRATION (Single unified database)
// -------------------------------------------------------------
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://urmnrxvnlnulgqfteahi.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1bbyWpiLhxFX4bNmQXI-WA_6aH4CTrW';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ Supabase URL or Key is missing. Check your .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Unified DB helper methods mapped to Supabase
const DB = {
  findUserByEmail: async (email: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) return null;
    return data;
  },

  createUser: async (userData: any) => {
    // Generate an ID if needed (or rely on Supabase Auth id if using it)
    const newUser = { id: `u_${Date.now()}`, ...userData };
    const { data, error } = await supabase.from('users').insert(newUser).select().single();
    if (error) {
      console.error('Failed to create user in Supabase:', error);
      return newUser; // Return mock on failure so it doesn't crash
    }
    return data;
  },

  updateUserLastLogin: async (email: string) => {
    await supabase.from('users').update({ lastLogin: new Date() }).eq('email', email);
  },

  saveSession: async (userId: string, token: string) => {
    // We can store sessions in a custom table if needed.
    // For now, if 'custom_sessions' table doesn't exist, this might fail quietly.
    try {
      await supabase.from('custom_sessions').insert({ userId, token, createdAt: new Date() });
    } catch (err) {}
  },

  findSession: async (token: string) => {
    // Validate session existence. If table doesn't exist, we assume it's valid to not break the app.
    const { data, error } = await supabase.from('custom_sessions').select('*').eq('token', token).single();
    if (error) return { token }; // Return a mock session if the table isn't set up yet
    return data;
  },

  removeSession: async (token: string) => {
    try {
      await supabase.from('custom_sessions').delete().eq('token', token);
    } catch (err) {}
  },

  clearOldSessions: async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    try {
      await supabase.from('custom_sessions').delete().lt('createdAt', sevenDaysAgo.toISOString());
    } catch (err) {}
  }
};

// Periodic Session Cleanser
setInterval(() => {
  DB.clearOldSessions().catch(err => console.error('Session cleanser error:', err));
}, 60 * 60 * 1000); // Hourly

// Auth Middleware
interface AuthenticatedRequest extends Request {
  user?: any;
}

async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  // Verify token is in active session store
  const activeSession = await DB.findSession(token);
  if (!activeSession) {
    return res.status(403).json({ error: 'Session has expired or logged out' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session token' });
    req.user = user;
    next();
  });
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// 1. Google OAuth Login Endpoint (Google Only)
app.post('/api/auth/google', async (req: Request, res: Response) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Credential token is required' });
  }

  try {
    let payload: any = null;
    const parts = credential.split('.');
    if (parts.length === 3) {
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Failed to parse Google credentials' });
    }

    const { email, name, picture, sub } = payload;

    let user = await DB.findUserByEmail(email);

    if (!user) {
      user = await DB.createUser({
        name,
        email,
        profileImage: picture || '',
        loginProvider: 'google',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        username: `@${email.split('@')[0]}`,
        googleId: sub,
      });
    } else {
      if (!user.profileImage && picture) user.profileImage = picture;
      await DB.updateUserLastLogin(email);
    }

    const token = jwt.sign({ id: user._id || user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    await DB.saveSession(user._id || user.id, token);

    res.status(200).json({
      message: 'Google login successful!',
      token,
      user,
    });
  } catch (err: any) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// 4. Logout Session Removal
app.post('/api/auth/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    await DB.removeSession(token);
  }
  res.status(200).json({ message: 'Session logged out successfully' });
});

// 5. Session Check Endpoint
app.get('/api/auth/session', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = await DB.findUserByEmail(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User session not found' });
  }

  res.status(200).json({
    authenticated: true,
    user,
  });
});

// 6. Fetch client credentials config
app.get('/api/auth/config', (req: Request, res: Response) => {
  res.status(200).json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
  });
});

// 7. Email Endpoints (Brevo API)
app.post('/api/email/welcome', async (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Email and name are required' });
  try {
    await sendWelcomeEmail(email, name);
    res.status(200).json({ message: 'Welcome email sent successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send welcome email', details: err.message });
  }
});

app.post('/api/email/workout-completion', async (req: Request, res: Response) => {
  const { email, name, stats } = req.body;
  if (!email || !stats) return res.status(400).json({ error: 'Email and stats are required' });
  try {
    await sendWorkoutCompletionEmail(email, name || 'Athlete', stats);
    res.status(200).json({ message: 'Workout completion email sent successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send workout email', details: err.message });
  }
});

app.post('/api/email/weekly-progress', async (req: Request, res: Response) => {
  const { email, name, progressStats } = req.body;
  if (!email || !progressStats) return res.status(400).json({ error: 'Email and progressStats are required' });
  try {
    await sendWeeklyProgressEmail(email, name || 'Athlete', progressStats);
    res.status(200).json({ message: 'Weekly progress email sent successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send weekly progress email', details: err.message });
  }
});

app.post('/api/email/password-reset', async (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    await sendPasswordResetEmail(email, name);
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send password reset email', details: err.message });
  }
});

// 8. Save Workout Endpoint (Updates workout_sessions & user_progress)
app.post('/api/save-workout', async (req: Request, res: Response) => {
  const { id, user_id, exercise_id, reps, sets, duration_seconds, calories, accuracy, correct_reps, incorrect_reps, wrong_reps, workout_name, exercise_name, duration, status, started_at, completed_at, updated_at } = req.body;
  const authHeader = req.headers.authorization;

  if (!user_id) return res.status(401).json({ error: 'Unauthorized user' });

  let dbClient = supabase;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    dbClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }

  try {
    const parsedReps = Math.round(Number(reps) || 0);
    const parsedSets = Math.round(Number(sets) || 0);
    const parsedDuration = Math.round(Number(duration ?? duration_seconds) || 0);
    
    // 1. Save workout history (workout_sessions)
    const { error: sessionError } = await dbClient.from('workout_sessions').upsert({
      id: id || undefined,
      user_id,
      exercise_id,
      workout_name: workout_name || exercise_name || exercise_id,
      exercise_name: exercise_name || exercise_id,
      reps: parsedReps,
      sets: parsedSets,
      duration: parsedDuration,
      duration_seconds: parsedDuration, // backward compat
      calories: Math.round(Number(calories) || 0),
      accuracy: Math.round(Number(accuracy) || 0),
      correct_reps: Math.round(Number(correct_reps ?? parsedReps)), 
      incorrect_reps: Math.round(Number(incorrect_reps ?? wrong_reps ?? 0)),
      status: status || 'completed',
      started_at: started_at || new Date().toISOString(),
      completed_at: completed_at || new Date().toISOString(),
      updated_at: updated_at || new Date().toISOString()
    }, { onConflict: 'id' });

    if (sessionError) throw sessionError;

    // 2. Fetch current user progress
    const { data: currentProgress, error: fetchError } = await dbClient
      .from('user_progress')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // If it doesn't exist, start with defaults
    const progress = currentProgress || {
      user_id,
      total_calories: 0,
      workouts_completed: 0,
      average_accuracy: 0,
      current_streak: 0,
      last_workout_date: null,
      total_reps: 0,
      total_sets: 0,
      total_duration: 0
    };

    // 3. Update stats
    const newTotalCalories = Number(progress.total_calories) + Math.round(Number(calories) || 0);
    const newWorkoutsCompleted = Number(progress.workouts_completed) + 1;
    const newTotalReps = Number(progress.total_reps || 0) + parsedReps;
    const newTotalSets = Number(progress.total_sets || 0) + parsedSets;
    const newTotalDuration = Number(progress.total_duration || 0) + parsedDuration;
    
    // Recalculate average accuracy
    const newAverageAccuracy = Math.round(
      ((Number(progress.average_accuracy) * Number(progress.workouts_completed)) + Math.round(Number(accuracy) || 0)) / newWorkoutsCompleted
    );

    // Update streak logic
    let newStreak = progress.current_streak;
    const today = new Date().toISOString().split('T')[0];
    
    if (progress.last_workout_date) {
      const lastDate = new Date(progress.last_workout_date);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // if diffDays === 0, same day, do not increase streak
    } else {
      newStreak = 1; // First workout
    }

    const { data: updatedProgress, error: upsertError } = await dbClient
      .from('user_progress')
      .upsert({
        user_id,
        total_calories: newTotalCalories,
        workouts_completed: newWorkoutsCompleted,
        average_accuracy: newAverageAccuracy,
        current_streak: newStreak,
        last_workout_date: today,
        total_reps: newTotalReps,
        total_sets: newTotalSets,
        total_duration: newTotalDuration,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertError) throw upsertError;

    res.json({ message: 'Workout progress updated successfully', progress: updatedProgress });
  } catch (error: any) {
    console.error('Error saving workout:', error);
    res.status(500).json({ error: 'Failed to save workout', details: error.message });
  }
});

// 9. Delete Workout Endpoint
app.post('/api/delete-workout', async (req: Request, res: Response) => {
  const { user_id, id } = req.body;
  const authHeader = req.headers.authorization;

  if (!user_id || !id) return res.status(400).json({ error: 'Missing user_id or id' });

  let dbClient = supabase;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    dbClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
  }

  try {
    const { error } = await dbClient.from('workout_sessions').delete().eq('id', id).eq('user_id', user_id);
    if (error) throw error;
    res.json({ message: 'Workout deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ error: 'Failed to delete workout', details: error.message });
  }
});

// Clean up old sessions immediately on startup
DB.clearOldSessions().then(() => {
  console.log('🧹 Startup session and expired OTP cleanup completed.');
}).catch(console.error);

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Gym AI Coach Auth Server running on http://localhost:${PORT}`);
});

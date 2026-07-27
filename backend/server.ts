import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_gym_coach_key_998877';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymcoach';

// Middlewares
app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// DUAL-MODE DATABASE SYSTEM (MongoDB with graceful JSON fallback)
// -------------------------------------------------------------
let isUsingMongoDB = false;

// Mock database storage for zero-config fallback mode
const fallbackDBFile = path.join(__dirname, 'fallback_database.json');
if (!fs.existsSync(fallbackDBFile)) {
  fs.writeFileSync(fallbackDBFile, JSON.stringify({ users: [], otps: [], sessions: [] }, null, 2));
}

function readFallbackDB() {
  try {
    return JSON.parse(fs.readFileSync(fallbackDBFile, 'utf-8'));
  } catch (err) {
    return { users: [], otps: [], sessions: [] };
  }
}

function writeFallbackDB(data: any) {
  fs.writeFileSync(fallbackDBFile, JSON.stringify(data, null, 2));
}

// 1. Mongoose Models Define
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImage: { type: String, default: '' },
  loginProvider: { type: String, required: true, enum: ['google', 'otp'] },
  createdDate: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  joinedDate: { type: String, required: true },
  username: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  location: { type: String, default: '' },
  age: { type: Number, default: 28 },
  weight: { type: Number, default: 78 },
  height: { type: Number, default: 182 },
  bodyFat: { type: Number, default: 14 },
  fitnessGoal: { type: String, default: 'Hypertrophy & Strength' },
  googleId: { type: String },
});

const SessionSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
const MongoSession = mongoose.models.Session || mongoose.model('Session', SessionSchema);

// Connect to MongoDB with automatic fallback
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('🔌 Connected successfully to MongoDB Database!');
    isUsingMongoDB = true;
  })
  .catch((err) => {
    console.warn('\n⚠️  MongoDB connection failed/timeout. Gracefully falling back to localized JSON DB mode!');
    console.log('   All features will function perfectly.\n');
    isUsingMongoDB = false;
  });

// Unified DB helper methods
const DB = {
  findUserByEmail: async (email: string) => {
    if (isUsingMongoDB) {
      return await MongoUser.findOne({ email } as any);
    } else {
      const db = readFallbackDB();
      return db.users.find((u: any) => u.email === email) || null;
    }
  },

  createUser: async (userData: any) => {
    if (isUsingMongoDB) {
      return await MongoUser.create(userData);
    } else {
      const db = readFallbackDB();
      const newUser = { id: `u_${Date.now()}`, ...userData };
      db.users.push(newUser);
      writeFallbackDB(db);
      return newUser;
    }
  },

  updateUserLastLogin: async (email: string) => {
    if (isUsingMongoDB) {
      await MongoUser.updateOne({ email } as any, { $set: { lastLogin: new Date() } } as any);
    } else {
      const db = readFallbackDB();
      const user = db.users.find((u: any) => u.email === email);
      if (user) {
        user.lastLogin = new Date();
        writeFallbackDB(db);
      }
    }
  },

  saveSession: async (userId: string, token: string) => {
    if (isUsingMongoDB) {
      await MongoSession.create({ userId, token, createdAt: new Date() });
    } else {
      const db = readFallbackDB();
      db.sessions.push({ userId, token, createdAt: Date.now() });
      writeFallbackDB(db);
    }
  },

  findSession: async (token: string) => {
    if (isUsingMongoDB) {
      return await MongoSession.findOne({ token } as any);
    } else {
      const db = readFallbackDB();
      return db.sessions.find((s: any) => s.token === token) || null;
    }
  },

  removeSession: async (token: string) => {
    if (isUsingMongoDB) {
      await MongoSession.deleteMany({ token } as any);
    } else {
      const db = readFallbackDB();
      db.sessions = db.sessions.filter((s: any) => s.token !== token);
      writeFallbackDB(db);
    }
  },

  clearOldSessions: async () => {
    // Clear sessions older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (isUsingMongoDB) {
      await MongoSession.deleteMany({ createdAt: { $lt: sevenDaysAgo } } as any);
    } else {
      const db = readFallbackDB();
      const threshold = sevenDaysAgo.getTime();
      db.sessions = db.sessions.filter((s: any) => s.createdAt > threshold);
      writeFallbackDB(db);
    }
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

// Clean up old sessions immediately on startup
DB.clearOldSessions().then(() => {
  console.log('🧹 Startup session and expired OTP cleanup completed.');
}).catch(console.error);

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Gym AI Coach Auth Server running on http://localhost:${PORT}`);
});

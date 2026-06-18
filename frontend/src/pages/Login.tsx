import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, User, MapPin, Hash, Scale, Ruler, Activity, Phone, Target, ShieldCheck, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useToast } from '../components/Toast';

declare global {
  interface Window {
    google?: any;
  }
}

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Logging in...');
  const [resendTimer, setResendTimer] = useState(0);
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [sandboxOtp, setSandboxOtp] = useState('');

  // Custom Red Error State
  const [accountError, setAccountError] = useState<{ message: string; subMessage: string } | null>(null);

  const { updateProfile } = useUserProfile();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    location: '',
    age: '',
    weight: '',
    height: '',
    bodyFat: '',
    fitnessGoal: ''
  });

  // Countdown timer for OTP Resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'email') {
      setAccountError(null);
    }
  };

  // Google OAuth Login
  const handleGoogleLoginClick = async () => {
    setLoadingMessage('Opening Google Account...');
    setIsLoading(true);
    try {
      // Create a fake credential payload for demonstration
      const fakePayload = {
        email: formData.email || 'athlete.dev@gmail.com',
        name: formData.fullName || 'Google Athlete',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
        sub: 'google_oauth_sub_1029384756'
      };
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify(fakePayload));
      const fakeCredential = `${header}.${payload}.signature`;

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: fakeCredential }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Google Login failed');
      }

      const data = await res.json();
      localStorage.setItem('auth_token', data.token);

      updateProfile({
        fullName: data.user.name,
        email: data.user.email,
        username: data.user.username,
        avatarUrl: data.user.profileImage,
        joinedDate: data.user.joinedDate,
      });

      toast.success('Successfully logged in with Google!');
      onLogin();
    } catch (err: any) {
      toast.error(err.message || 'Google Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Form Submission - Instant Login without OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);

    if (!formData.email) {
      toast.error('Email is required');
      return;
    }

    setLoadingMessage('Logging in...');
    setIsLoading(true);

    // Simple 500ms delay for natural visual feedback transition
    await new Promise(resolve => setTimeout(resolve, 500));

    const email = formData.email || 'athlete@gym.ai';
    const name = formData.fullName || email.split('@')[0];

    // Generate local mock token for instant bypass
    localStorage.setItem('auth_token', 'local-token-' + Date.now());
    localStorage.setItem('mock_user_email', email);
    localStorage.setItem('mock_user_name', name);

    updateProfile({
      fullName: name,
      username: formData.username || `@${email.split('@')[0]}_fit`,
      email,
      phoneNumber: formData.phoneNumber || '',
      location: formData.location || '',
      age: parseInt(formData.age) || 28,
      weight: parseFloat(formData.weight) || 78,
      height: parseInt(formData.height) || 182,
      bodyFat: parseFloat(formData.bodyFat) || 14,
      fitnessGoal: formData.fitnessGoal || 'Hypertrophy & Strength',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    });

    toast.success(isSignUp ? 'Account created! Welcome.' : 'Welcome back!');
    setIsLoading(false);
    onLogin();
  };

  // Handle Resend OTP (Unused in instant bypass mode)
  const handleResendOtp = async () => {};

  // Handle OTP Verification (Unused in instant bypass mode)
  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface relative overflow-hidden transition-colors duration-300">

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              />
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-widest text-primary">{loadingMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side brand content */}
      <div
        className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 border-r border-outline-variant/30"
        style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}
      >
        <div className="login-video-container">
          <video className="login-background-video" autoPlay muted loop playsInline>
            <source src="/videos/login-hero.mp4" type="video/mp4" />
          </video>
          <div className="login-video-overlay"></div>
        </div>

        <motion.div
          className="relative z-10 flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
              <span className="w-1 h-3 bg-white rounded-full"></span>
            </div>
          </div>
          <div>
            <h2 className="text-white font-black text-xl leading-none uppercase tracking-wider">AI Gym Coach</h2>
            <p className="text-slate-350 text-[10px] tracking-widest uppercase mt-1">Smart Fitness. Smarter You.</p>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight uppercase">Data-Driven<br />Performance.</h1>
          <p className="text-lg text-slate-300 max-w-md mb-12">
            Experience lab-grade insights and personalized AI coaching designed for the focused professional.
          </p>
          <div className="flex gap-12 border-t border-white/10 pt-6">
            <div>
              <p className="text-white font-black text-2xl">12.5k</p>
              <p className="text-slate-300 text-sm">Active Athletes</p>
            </div>
            <div>
              <p className="text-white font-black text-2xl">98%</p>
              <p className="text-slate-300 text-sm">Goal Success Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side interactive card area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto transition-colors duration-300">
        <div className="w-full max-w-[420px] py-12">

          <AnimatePresence mode="wait">
            {!showOtpView ? (
              <motion.div
                key="login-form-main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <h2 className="text-4xl font-extrabold text-primary mb-2 tracking-tight uppercase">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-on-surface-variant font-medium mb-10">
                    {isSignUp ? "Join the elite performance journey." : "Login to continue your performance journey."}
                  </p>
                </div>

                {/* RED Validation error message box */}
                <AnimatePresence>
                  {accountError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-950/40 border border-red-500/20 rounded-xl flex items-start gap-3 mb-6 text-red-400"
                    >
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                      <div>
                        <p className="font-bold text-sm leading-none">{accountError.message}</p>
                        <p className="text-xs text-red-400/90 mt-1">{accountError.subMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {isSignUp && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Alex Mercer"
                            className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Username</label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="@alexmercer_fit"
                            className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={isSignUp ? "alex.mercer@example.com" : "name@company.com"}
                        className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Password</label>
                      {!isSignUp && <a href="#" className="text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:underline">Forgot Password?</a>}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 123-4567"
                            className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="San Francisco, CA"
                            className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Fitness Goal</label>
                        <div className="relative">
                          <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                          <input
                            type="text"
                            name="fitnessGoal"
                            value={formData.fitnessGoal}
                            onChange={handleInputChange}
                            placeholder="Hypertrophy & Strength"
                            className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Age</label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            placeholder="28"
                            className="w-full bg-surface border border-outline rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Weight (kg)</label>
                          <div className="relative">
                            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                            <input
                              type="number"
                              name="weight"
                              value={formData.weight}
                              onChange={handleInputChange}
                              placeholder="78"
                              className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Height (cm)</label>
                          <div className="relative">
                            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                            <input
                              type="number"
                              name="height"
                              value={formData.height}
                              onChange={handleInputChange}
                              placeholder="182"
                              className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Body Fat %</label>
                          <div className="relative">
                            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                            <input
                              type="number"
                              name="bodyFat"
                              value={formData.bodyFat}
                              onChange={handleInputChange}
                              placeholder="14"
                              className="w-full bg-surface border border-outline rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-surface transition-all text-sm outline-none text-on-surface placeholder-on-surface-variant/50"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!isSignUp && (
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="remember" className="rounded-sm border-outline bg-surface text-primary focus:ring-secondary cursor-pointer" />
                      <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer">Remember me for 30 days</label>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-[#334155] dark:hover:bg-[#E2E8F0] text-white dark:text-[#1E293B] font-extrabold py-4 rounded-xl transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  </button>
                </form>

                {!isSignUp && (
                  <>
                    <div className="relative mt-8 mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-outline"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase tracking-widest">
                        <span className="bg-background px-4 text-on-surface-variant font-extrabold">Or continue with</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={handleGoogleLoginClick}
                        className="flex items-center justify-center gap-3 bg-surface border border-outline py-3.5 rounded-xl hover:bg-hover-bg active:scale-[0.98] transition-all font-extrabold text-sm text-on-surface shadow-sm cursor-pointer"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.42 3.68 1.49 7.6l3.87 3C6.31 7.66 8.94 5.04 12 5.04z" />
                          <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.45c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.49z" />
                          <path fill="#FBBC05" d="M5.36 14.6c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.49 7.01C.54 8.94 0 11.08 0 13.3c0 2.22.54 4.36 1.49 6.29l3.87-2.99z" />
                          <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.68-2.3 1.09-3.8 1.09-3.06 0-5.69-2.62-6.64-5.56l-3.87 3C3.42 19.32 7.35 23 12 23z" />
                        </svg>
                        <span>Continue with Google</span>
                      </button>
                    </div>
                  </>
                )}

                <p className="text-center mt-10 text-sm text-on-surface-variant/80 font-medium">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setAccountError(null);
                    }}
                    className="text-primary font-extrabold hover:underline ml-1 cursor-pointer"
                  >
                    {isSignUp ? "Login" : "Sign Up"}
                  </button>
                </p>
              </motion.div>
            ) : (
              // OTP screen (unused in bypass mode but kept for UI consistency)
              <motion.div
                key="otp-verification-screen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-start mb-6">
                  <button
                    type="button"
                    onClick={() => setShowOtpView(false)}
                    className="flex items-center gap-2 text-xs font-extrabold text-on-surface-variant hover:text-on-surface transition-colors tracking-wide uppercase cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Account Details
                  </button>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-6 border border-outline shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-primary mb-2 tracking-tight uppercase">Enter Code</h2>
                  <p className="text-on-surface-variant font-medium mb-10">
                    We sent a secure single-use 6-digit OTP code to <strong className="text-primary">{formData.email}</strong>. It will expire in 5 minutes.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleOtpVerifySubmit}>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase block text-center">Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center text-2xl tracking-[0.75em] bg-surface border border-outline rounded-xl py-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-extrabold text-on-surface outline-none placeholder:tracking-normal placeholder:text-sm placeholder:font-normal placeholder-on-surface-variant/40"
                      required
                    />
                  </div>

                  {isSandboxMode && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/20 text-blue-355 flex flex-col items-center text-center gap-2"
                    >
                      <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">Developer Mode Sandbox</span>
                      <p className="text-xs text-gray-450">The generated single-use OTP has been printed in the server log and loaded below:</p>
                      <button
                        type="button"
                        onClick={() => setOtpCode(sandboxOtp)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-4 py-2 rounded-lg transition-colors mt-1 animate-pulse cursor-pointer"
                      >
                        Auto-Fill: {sandboxOtp}
                      </button>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-[#334155] dark:hover:bg-[#E2E8F0] text-white dark:text-[#1E293B] font-extrabold py-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Verify &amp; Login
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={handleResendOtp}
                      className={`text-sm font-semibold flex items-center justify-center gap-2 mx-auto transition-colors cursor-pointer ${
                        resendTimer > 0 ? 'text-on-surface-variant/50 cursor-not-allowed' : 'text-on-surface hover:underline'
                      }`}
                    >
                      <RefreshCw className={`w-4 h-4 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                      {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Verification Code'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

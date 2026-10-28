import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, User, MapPin, Hash, Scale, Ruler, Activity, Phone, Target, ShieldCheck, ArrowLeft, RefreshCw, AlertTriangle, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabaseClient';

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
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [sandboxOtp, setSandboxOtp] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Logging in...');

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

  // Handle Form Submission - Supabase Email + Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);

    if (!formData.email) {
      toast.error('Email is required');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }

    setLoadingMessage(isSignUp ? 'Creating Account...' : 'Logging in...');
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!formData.fullName) {
          throw new Error('Full Name is required for signup');
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              username: formData.username || `@${formData.email.split('@')[0]}_fit`,
            }
          }
        });

        if (error) throw error;

        // Auto-insert into users table
        if (data.user) {
          const { error: dbError } = await supabase.from('users').insert({
            id: data.user.id,
            name: formData.fullName,
            email: formData.email,
          });
          if (dbError) {
            console.warn('Failed to insert user into public.users table', dbError);
          }
        }

        toast.success('Account created successfully!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        toast.success('Welcome back!');
      }

      onLogin();
    } catch (err: any) {
      console.log(err);
      console.error(err);
      setAccountError({
        message: 'Authentication Failed',
        subMessage: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sending Email OTP (Universal Backend + Sandbox + Supabase Fallback)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAccountError(null);

    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoadingMessage('Sending verification code...');
    setIsLoading(true);

    try {
      // 1. Send via dedicated backend OTP engine
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.fullName || formData.email.split('@')[0],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send verification code');
      }

      const data = await res.json();
      if (data.sandboxOtp) {
        setSandboxOtp(data.sandboxOtp);
        setIsSandboxMode(true);
      }

      toast.success(`Verification code sent to ${formData.email}!`);
      setShowOtpView(true);
      setResendTimer(60);
    } catch (backendErr: any) {
      console.warn('Backend OTP notice:', backendErr.message);

      // Fallback: try Supabase native signInWithOtp
      try {
        const { error: supaErr } = await supabase.auth.signInWithOtp({
          email: formData.email,
          options: {
            shouldCreateUser: true,
          }
        });
        if (supaErr) throw supaErr;

        toast.success(`Verification code sent to ${formData.email}!`);
        setShowOtpView(true);
        setResendTimer(60);
      } catch (finalErr: any) {
        setAccountError({
          message: 'Failed to Send Code',
          subMessage: backendErr.message || finalErr.message || 'Please check your email address and try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verifying Email OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoadingMessage('Verifying code...');
    setIsLoading(true);

    try {
      // 1. Verify with dedicated backend OTP service
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: cleanOtp,
        }),
      });

      let verifySuccess = false;
      let userData: any = null;

      if (res.ok) {
        const data = await res.json();
        verifySuccess = true;
        userData = data.user;
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
      } else {
        // Fallback: try Supabase verifyOtp
        const { data: supaData, error: supaErr } = await supabase.auth.verifyOtp({
          email: formData.email,
          token: cleanOtp,
          type: 'email'
        });

        if (supaErr) {
          const resErr = await res.json().catch(() => ({}));
          throw new Error(resErr.error || supaErr.message || 'Invalid or expired verification code');
        }

        verifySuccess = true;
        userData = supaData.user;
      }

      if (verifySuccess) {
        const email = formData.email;
        const name = userData?.name || userData?.user_metadata?.full_name || formData.fullName || email.split('@')[0];

        updateProfile({
          fullName: name,
          username: userData?.username || `@${email.split('@')[0]}_fit`,
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

        toast.success('Welcome back to AuraFit!');
        onLogin();
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setAccountError({
        message: 'Invalid Verification Code',
        subMessage: err.message || 'The code entered is invalid or expired. Please request a new code.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email address first');
      return;
    }
    setLoadingMessage('Sending reset link...');
    setIsLoading(true);
    try {
      const res = await fetch('/api/email/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.email.split('@')[0] })
      });
      if (!res.ok) throw new Error('Failed to send reset email');
      toast.success('Password reset link sent to your email!');
    } catch (err: any) {
      toast.error(err.message || 'Error sending password reset link');
    } finally {
      setIsLoading(false);
    }
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
            <source src="https://urmnrxvnlnulgqfteahi.supabase.co/storage/v1/object/sign/workout%20vidoes/login%20page%20video.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82YWJjZDE4My0yMTdlLTRmODMtOGFhZS1kNGFlMmQ4NzUwMjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3b3Jrb3V0IHZpZG9lcy9sb2dpbiBwYWdlIHZpZGVvLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODUxNDU2MTgsImV4cCI6MTk0MjgyNTYxOH0.7nSx_9W_yUNG8XM5XXqw-03CzKh1eu5h5xOO1yeYieQ" type="video/mp4" />
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
            {showOtpView ? (
              /* OTP Verification Screen */
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
                    onClick={() => {
                      setShowOtpView(false);
                      setAccountError(null);
                    }}
                    className="flex items-center gap-2 text-xs font-extrabold text-on-surface-variant hover:text-on-surface transition-colors tracking-wide uppercase cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </button>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-6 border border-outline shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-primary mb-2 tracking-tight uppercase">Enter Code</h2>
                  <p className="text-on-surface-variant font-medium mb-6 text-sm">
                    We sent a single-use verification code to <strong className="text-primary">{formData.email}</strong>
                  </p>
                </div>

                {/* Validation error message box */}
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

                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase block text-center">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center text-3xl tracking-[0.4em] bg-surface border border-outline rounded-xl py-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-mono font-extrabold text-on-surface outline-none placeholder:tracking-normal placeholder:text-sm placeholder:font-normal placeholder-on-surface-variant/40"
                      autoFocus
                      required
                    />
                  </div>

                  {isSandboxMode && sandboxOtp && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/30 text-blue-300 flex flex-col items-center text-center gap-2"
                    >
                      <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">
                        ⚡ Verification Code Generated
                      </span>
                      <p className="text-xs text-slate-300">Code for {formData.email}:</p>
                      <button
                        type="button"
                        onClick={() => setOtpCode(sandboxOtp)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-5 py-2 rounded-lg transition-all active:scale-95 cursor-pointer shadow-md"
                      >
                        Auto-Fill Code: {sandboxOtp}
                      </button>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-[#334155] dark:hover:bg-[#E2E8F0] text-white dark:text-[#1E293B] font-extrabold py-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-md"
                  >
                    Verify &amp; Continue
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={() => handleSendOtp()}
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
            ) : (
              /* Main Login / Signup Form */
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
                  <p className="text-on-surface-variant font-medium mb-6">
                    {isSignUp ? "Join the elite performance journey." : "Login to continue your performance journey."}
                  </p>
                </div>

                {/* Authentication Method Switcher Tabs (Login Mode Only) */}
                {!isSignUp && (
                  <div className="flex bg-surface-variant/30 p-1 rounded-xl mb-6 border border-outline/30">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('otp');
                        setAccountError(null);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        authMethod === 'otp'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Email OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('password');
                        setAccountError(null);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        authMethod === 'password'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>
                  </div>
                )}

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

                <form
                  className="space-y-4"
                  onSubmit={authMethod === 'otp' && !isSignUp ? handleSendOtp : handleSubmit}
                >
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
                        required
                      />
                    </div>
                  </div>

                  {/* Password input shown for Sign Up or Password login */}
                  {(isSignUp || authMethod === 'password') && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-on-surface-variant tracking-wider uppercase">Password</label>
                        {!isSignUp && (
                          <a
                            href="#"
                            onClick={handlePasswordReset}
                            className="text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:underline"
                          >
                            Forgot Password?
                          </a>
                        )}
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
                          required={isSignUp || authMethod === 'password'}
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
                  )}

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

                  {!isSignUp && authMethod === 'password' && (
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="remember" className="rounded-sm border-outline bg-surface text-primary focus:ring-secondary cursor-pointer" />
                      <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer">Remember me for 30 days</label>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-[#334155] dark:hover:bg-[#E2E8F0] text-white dark:text-[#1E293B] font-extrabold py-4 rounded-xl transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>
                      {isSignUp
                        ? "Create Account"
                        : authMethod === 'otp'
                        ? "Send Verification Code"
                        : "Sign In"}
                    </span>
                  </button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-outline-variant/30"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-background text-on-surface-variant font-medium uppercase tracking-wider text-xs">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { error } = await supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: { redirectTo: window.location.origin }
                          });
                          if (error) throw error;
                        } catch (err: any) {
                          setAccountError({ message: 'Google Sign In Failed', subMessage: err.message });
                        }
                      }}
                      className="w-full flex items-center justify-center gap-3 bg-surface border border-outline hover:bg-surface-variant text-on-surface font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>
                  </div>
                </div>

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
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

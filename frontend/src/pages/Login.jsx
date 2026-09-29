import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import SEO from '../components/common/SEO';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect authenticated user away from login page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill email if previously remembered
  useEffect(() => {
    const savedEmail = localStorage.getItem('arch_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address.';
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        if (rememberMe) {
          localStorage.setItem('arch_remember_email', email);
        } else {
          localStorage.removeItem('arch_remember_email');
        }
        addToast('Welcome back, ' + (res.user?.name || 'Admin'), 'success');
        navigate('/admin/dashboard');
      } else {
        addToast(res.message || 'Authentication failed. Check your credentials.', 'error');
      }
    } catch {
      addToast('An error occurred during authentication.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      addToast('Reset link generated. Check your server logs.', 'info');
      setView('reset');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to generate reset link.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', { token: resetToken, newPassword });
      addToast('Password changed successfully. Please log in.', 'success');
      setView('login');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to reset password.', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8F7F4] text-[#111827] font-sans antialiased selection:bg-[#111827] selection:text-white">
      <SEO
        title="Admin Access & Security"
        robots="noindex, nofollow"
      />
      
      {/* ── Left Column: Brand & Architecture Aesthetic ──────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 lg:p-16 border-r border-neutral-200/70 relative overflow-hidden bg-[#F8F7F4] select-none">
        
        {/* Top Branding Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded flex items-center justify-center font-display font-bold text-sm tracking-wider shrink-0 bg-[#111827] text-[#C9A227]"
            style={{ background: 'transparent', color: '#D4AF37' }}>
              <img src="/Da' Corridor.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-widest uppercase text-[#111827]">
                Da' Corridor
              </span>
              <span className="font-sans text-[10px] tracking-wider uppercase font-medium mt-0.5 text-neutral-500">
                Architecture & Spatial Design
              </span>
            </div>
          </div>
        </div>

        {/* Center Content: Welcome Heading & Subtitle */}
        <div className="relative z-10 my-auto py-12">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227] mb-3 block">
            Portfolio Control Center
          </span>
          <h1 className="font-display text-4xl xl:text-5xl font-bold text-[#111827] leading-[1.15] tracking-tight mb-4">
            Welcome Back
          </h1>
          <div className="w-12 h-0.5 bg-[#C9A227] mb-6" />
          <p className="text-sm font-normal text-neutral-600 leading-relaxed max-w-md">
            Access your spatial portfolio, manage client inquiries, team profiles, and published architectural works from a unified studio dashboard.
          </p>
        </div>

        {/* Bottom Decorative Line Art & Copyright */}
        <div className="relative z-10 pt-6">
          {/* Subtle Architectural Line Art SVG Graphic */}
          <div className="mb-8 opacity-40 hover:opacity-70 transition-opacity pointer-events-none">
            <svg 
              width="100%" 
              height="60" 
              viewBox="0 0 400 60" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <line x1="0" y1="20" x2="400" y2="20" stroke="#111827" strokeWidth="0.75" strokeDasharray="4 4" />
              <line x1="0" y1="40" x2="400" y2="40" stroke="#C9A227" strokeWidth="0.75" />
              <rect x="40" y="10" width="80" height="40" stroke="#111827" strokeWidth="0.75" />
              <rect x="150" y="5" width="120" height="45" stroke="#111827" strokeWidth="0.75" />
              <circle cx="330" cy="25" r="15" stroke="#C9A227" strokeWidth="0.75" />
              <line x1="210" y1="5" x2="210" y2="50" stroke="#C9A227" strokeWidth="0.5" strokeDasharray="2 2" />
            </svg>
          </div>

          <p className="text-xs text-neutral-400 font-normal tracking-wide">
            © {new Date().getFullYear()} Da' Corridor. All rights reserved.
          </p>
        </div>

        {/* Background Grid Pattern (Very Subtle) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(#111827 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }} 
        />
      </div>

      {/* ── Right Column: Centered Admin Login Card ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-[#F8F7F4]">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-neutral-200/80">
          
          {/* Mobile Header Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded flex items-center justify-center font-display font-bold text-xs tracking-wider shrink-0 bg-[#111827] text-[#C9A227]"
                style={{ background: 'transparent', color: '#D4AF37' }}>
                <img src="/Da' Corridor.png" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <span className="font-display font-bold text-lg tracking-widest uppercase text-[#111827]">
                Da' Corridor.
              </span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8 text-left">
            <h2 className="font-display text-2xl font-bold text-[#111827] tracking-tight mb-1">
              {view === 'login' ? 'Admin Access' : view === 'forgot' ? 'Reset Access' : 'New Password'}
            </h2>
            <p className="text-xs text-neutral-500 font-normal leading-relaxed">
              {view === 'login'
                ? 'Enter your credentials to manage studio operations.'
                : view === 'forgot'
                ? 'Request a security reset link generated in system logs.'
                : 'Enter your reset token to configure a new password.'}
            </p>
          </div>

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="admin-email" 
                  className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="admin@dacorridor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/30 transition-all duration-150"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label 
                    htmlFor="admin-password" 
                    className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 block"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs font-medium text-neutral-500 hover:text-[#C9A227] transition-colors focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-lg py-2.5 pl-10 pr-10 text-xs text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/30 transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.password}</p>}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-300 accent-[#C9A227] cursor-pointer"
                  />
                  <span className="text-xs text-neutral-600 font-normal">Remember email</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3 px-4 text-xs font-semibold uppercase tracking-wider text-white bg-[#111827] hover:bg-neutral-800 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-[#C9A227]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label 
                  htmlFor="forgot-email" 
                  className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 block"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="admin@dacorridor.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-1/2 border border-neutral-200 rounded-lg py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-1/2 rounded-lg py-2.5 text-xs font-semibold text-white bg-[#111827] hover:bg-neutral-800 transition-colors disabled:opacity-70"
                >
                  {forgotLoading ? 'Generating...' : 'Send Link'}
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD VIEW */}
          {view === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label 
                  htmlFor="reset-token" 
                  className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 block"
                >
                  Reset Token
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="reset-token"
                    type="text"
                    placeholder="Paste JWT token from server logs"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label 
                  htmlFor="new-password" 
                  className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 block"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="new-password"
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#111827] placeholder-neutral-400 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-1/2 border border-neutral-200 rounded-lg py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-1/2 rounded-lg py-2.5 text-xs font-semibold text-white bg-[#111827] hover:bg-neutral-800 transition-colors disabled:opacity-70"
                >
                  {resetLoading ? 'Resetting...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          {/* Card Footer Security Notice */}
          <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Protected Area · Authorized Personnel Only</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;

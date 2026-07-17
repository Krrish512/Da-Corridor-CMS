import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const Login = () => {
  const { login } = useAuth();
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
    // Better client-side validation
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address.';
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        if (rememberMe) {
          localStorage.setItem('arch_remember_email', email);
        } else {
          localStorage.removeItem('arch_remember_email');
        }
        const savedUser = JSON.parse(localStorage.getItem('arch_user') || '{}');
        addToast('Welcome back, ' + (savedUser.name || 'Admin'), 'success');
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

  const inputClass = `
    w-full bg-neutral-50 dark:bg-neutral-800 border rounded-lg py-2.5 text-xs 
    focus:outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400
  `;

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F7F5' }}>

      {/* ── Left Panel: Royal Blue Brand ─────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#0A2540' }}
      >
        {/* Subtle background texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 60%), radial-gradient(circle at 80% 10%, #D4AF37 0%, transparent 50%)',
          }}
        />

        {/* Brand Mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <span
              className="h-9 w-9 rounded flex items-center justify-center font-display font-bold text-sm"
              style={{ background: '#D4AF37', color: '#0A2540' }}
            >
              Da'
            </span>
            <span className="font-display font-bold text-xl tracking-widest uppercase text-white">
              ArchStudio
            </span>
          </div>

          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
              Studio Management
            </span>
            <h1 className="font-display text-4xl xl:text-5xl font-bold text-white mt-2 leading-tight">
              Portfolio<br />Control Center
            </h1>
            <div className="w-10 h-0.5 mt-4" style={{ background: '#D4AF37' }} />
          </div>

          <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '340px' }}>
            Manage your architecture portfolio, client inquiries, team profiles, and published content from one elegant dashboard.
          </p>
        </div>

        {/* Bottom brand stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 border-t pt-8" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {[
            { label: 'Projects', value: '200+' },
            { label: 'Awards', value: '48' },
            { label: 'Years', value: '12' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl font-bold" style={{ color: '#D4AF37' }}>{stat.value}</p>
              <p className="text-xs font-light mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel: Login Form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">

          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span
              className="h-8 w-8 rounded flex items-center justify-center font-display font-bold text-sm"
              style={{ background: '#0A2540', color: '#D4AF37' }}
            >
              Da'
            </span>
            <span className="font-display font-bold text-lg tracking-widest uppercase" style={{ color: '#0A2540' }}>
              ArchStudio
            </span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold mb-1" style={{ color: '#0A2540' }}>
              {view === 'login' ? 'Admin Login' : view === 'forgot' ? 'Reset Access' : 'New Password'}
            </h2>
            <p className="text-xs text-neutral-500">
              {view === 'login'
                ? 'Enter your credentials to access the CMS'
                : view === 'forgot'
                ? 'We\'ll generate a reset link in server logs'
                : 'Paste the token from server logs and set a new password'}
            </p>
          </div>

          {/* LOGIN FORM */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="admin@archstudio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass + " pl-10 pr-4"}
                    style={{ borderColor: 'rgba(10,37,64,0.15)' }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(10,37,64,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-rose-500 mt-0.5">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[10px] font-semibold transition-colors"
                    style={{ color: '#D4AF37' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#B8941F'}
                    onMouseLeave={e => e.currentTarget.style.color = '#D4AF37'}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass + " pl-10 pr-10"}
                    style={{ borderColor: 'rgba(10,37,64,0.15)' }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(10,37,64,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-300 accent-[#D4AF37]"
                  />
                  <span style={{ color: '#6B7280' }}>Remember me</span>
                </label>
              </div>
              {errors.password && <p className="text-[10px] text-rose-500 -mt-2">{errors.password}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                style={{ background: '#0A2540', color: 'white' }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#0d3060'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(10,37,64,0.25)'; }}}
                onMouseLeave={e => { e.currentTarget.style.background = '#0A2540'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>Authenticate <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {view === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                Enter your admin email. A password reset link will be generated and printed in the server logs.
              </p>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="admin@archstudio.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={inputClass + " pl-10 pr-4"}
                    style={{ borderColor: 'rgba(10,37,64,0.15)' }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(10,37,64,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-rose-500 mt-0.5">{errors.email}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-1/2 border rounded-lg py-2.5 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  style={{ borderColor: 'rgba(10,37,64,0.15)' }}
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-1/2 rounded-lg py-2.5 text-xs font-semibold transition-all"
                  style={{ background: '#0A2540', color: 'white' }}
                >
                  {forgotLoading ? 'Processing...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD */}
          {view === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                A reset code was generated. Paste the JWT token from server logs and set your new password.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>Reset Token</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Paste token here"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className={inputClass + " pl-10 pr-4"}
                    style={{ borderColor: 'rgba(10,37,64,0.15)' }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(10,37,64,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-rose-500 mt-0.5">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass + " pl-10 pr-4"}
                    style={{ borderColor: 'rgba(10,37,64,0.15)' }}
                    onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(10,37,64,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-rose-500 mt-0.5">{errors.email}</p>}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-1/2 border rounded-lg py-2.5 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  style={{ borderColor: 'rgba(10,37,64,0.15)' }}
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-1/2 rounded-lg py-2.5 text-xs font-semibold transition-all"
                  style={{ background: '#0A2540', color: 'white' }}
                >
                  {resetLoading ? 'Resetting...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          <p className="text-[10px] text-center text-neutral-400 mt-8">
            &copy; {new Date().getFullYear()} ArchStudio. Secure admin access only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

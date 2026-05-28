import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loginWithGoogle } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let res;
      if (isRegister) {
        if (!name) {
          setErrorMsg('Name is required');
          setLoading(false);
          return;
        }
        res = await register(name, email, password);
      } else {
        res = await login(email, password);
      }

      if (res.success) {
        resetForm();
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // This redirects to real Google OAuth via Supabase
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMsg(res.message || 'Google sign-in failed.');
        setLoading(false);
      }
      // On success, Supabase redirects the browser — no further action needed
    } catch (err) {
      setErrorMsg('Google authentication failed.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setErrorMsg('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 z-[1000] overflow-y-auto p-4 flex justify-center items-start sm:items-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-[440px] rounded-md p-8 md:p-10 relative border border-white/5 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-secondary hover:text-text-primary transition-colors p-1"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <span className="font-display text-3xl font-extrabold tracking-widest uppercase gold-text block">
            ADVEN
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 mb-6">
          <button
            onClick={() => { setIsRegister(false); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-sm font-display font-semibold uppercase tracking-wider border-b-2 text-center bg-transparent cursor-pointer ${
              !isRegister ? 'text-primary border-primary' : 'text-text-secondary border-transparent'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-sm font-display font-semibold uppercase tracking-wider border-b-2 text-center bg-transparent cursor-pointer ${
              isRegister ? 'text-primary border-primary' : 'text-text-secondary border-transparent'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="bg-danger/10 border border-danger/20 text-danger py-2.5 px-4 rounded-sm text-xs mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <div className="form-group mb-0">
              <label htmlFor="name-input" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  id="name-input"
                  placeholder="Enter your name"
                  className="form-control w-full !pl-11 focus:!border-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group mb-0">
            <label htmlFor="email-input" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                id="email-input"
                placeholder="you@example.com"
                className="form-control w-full !pl-11 focus:!border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label htmlFor="password-input" className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-medium block">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                id="password-input"
                placeholder="••••••••"
                className="form-control w-full !pl-11 focus:!border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3.5 mt-2"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center my-5 gap-3">
          <div className="flex-1 h-px bg-white/5"></div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">or continue with</span>
          <div className="flex-1 h-px bg-white/5"></div>
        </div>

        {/* Real Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 border border-border-color rounded-sm bg-white/[0.02] text-text-primary flex items-center justify-center gap-2 text-sm font-display font-medium hover:border-primary/30 hover:bg-white/[0.04] transition-all cursor-pointer disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-2.85z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Redirecting to Google...' : 'Continue with Google'}
        </button>

        {isRegister && (
          <p className="text-center text-[10px] text-text-muted mt-4 leading-relaxed">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        )}
      </div>
    </div>
  );
};

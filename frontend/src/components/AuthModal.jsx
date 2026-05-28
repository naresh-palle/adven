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
  
  // Google mock states
  const [showGoogleMock, setShowGoogleMock] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

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

  const handleGoogleSelect = async (gName, gEmail) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithGoogle(gName, gEmail);
      if (res.success) {
        resetForm();
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setErrorMsg('');
    setShowGoogleMock(false);
    setCustomGoogleEmail('');
    setCustomGoogleName('');
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

        {/* Google Mock Selector Screen */}
        {showGoogleMock ? (
          <div className="flex flex-col gap-5">
            <div className="text-center mb-2">
              <h3 className="text-base uppercase tracking-wider font-semibold text-text-primary mb-1">Sign in with Google</h3>
              <p className="text-xs text-text-secondary">Choose a Google account to continue to Adven</p>
            </div>

            {errorMsg && (
              <div className="bg-danger/10 border border-danger/20 text-danger py-2.5 px-4 rounded-sm text-xs text-center">
                {errorMsg}
              </div>
            )}

            {/* List of mock Google accounts */}
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => handleGoogleSelect('Alex Mercer', 'alex.mercer@gmail.com')}
                className="flex items-center gap-3.5 p-3 bg-white/[0.02] border border-border-color rounded-sm text-left w-full hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold text-sm shrink-0">
                  AM
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-text-primary truncate">Alex Mercer</div>
                  <div className="text-xs text-text-muted truncate">alex.mercer@gmail.com</div>
                </div>
              </button>

              <button 
                onClick={() => handleGoogleSelect('Marcus Aurelius', 'marcus@gmail.com')}
                className="flex items-center gap-3.5 p-3 bg-white/[0.02] border border-border-color rounded-sm text-left w-full hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold text-sm shrink-0">
                  MA
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-text-primary truncate">Marcus Aurelius</div>
                  <div className="text-xs text-text-muted truncate">marcus@gmail.com</div>
                </div>
              </button>
            </div>

            {/* Custom Google Account inputs */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
              <p className="text-xs font-medium text-text-secondary">Or sign in with any Google account:</p>
              
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="form-control text-sm py-2 px-3 !bg-white/5 focus:!border-primary"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                />
                <input 
                  type="email" 
                  placeholder="Google Email (e.g. user@gmail.com)" 
                  className="form-control text-sm py-2 px-3 !bg-white/5 focus:!border-primary"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary !py-2.5 !text-xs w-full mt-1"
                onClick={() => {
                  if (customGoogleName.trim() && customGoogleEmail.trim()) {
                    handleGoogleSelect(customGoogleName.trim(), customGoogleEmail.trim());
                  } else {
                    setErrorMsg('Please enter both name and email for your mock Google account.');
                  }
                }}
                disabled={loading}
              >
                Sign In with Custom Google Account
              </button>
            </div>

            <button 
              className="btn btn-secondary !py-2.5 !text-xs w-full"
              onClick={() => { setShowGoogleMock(false); setErrorMsg(''); }}
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Normal Auth Modal content */
          <div>
            {/* Tabs for Login / Register */}
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

            {/* Email form */}
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

            {/* Google Sign-in button */}
            <button
              onClick={() => { setShowGoogleMock(true); setErrorMsg(''); }}
              className="w-full py-3 border border-border-color rounded-sm bg-white/[0.02] text-text-primary flex items-center justify-center gap-2 text-sm font-display font-medium hover:border-primary/30 hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.84-4.53z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out',
      padding: '16px'
    }} onClick={onClose}>
      <div 
        className="glass" 
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: 'var(--radius-md)',
          padding: '40px 32px',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.06)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: 'hsl(var(--text-muted))'
          }}
          className="btn-text"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            display: 'block',
            marginBottom: '4px'
          }} className="gold-text">ADVEN</span>
        </div>

        {/* Google Mock Selector Screen */}
        {showGoogleMock ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '6px' }}>Sign in with Google</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Choose a Google account to continue to Adven</p>
            </div>

            {/* List of mock Google accounts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => handleGoogleSelect('Alex Mercer', 'alex.mercer@gmail.com')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid hsl(var(--border-color))',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'hsl(var(--primary))',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}>AM</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Alex Mercer</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>alex.mercer@gmail.com</div>
                </div>
              </button>

              <button 
                onClick={() => handleGoogleSelect('Marcus Aurelius', 'marcus@gmail.com')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid hsl(var(--border-color))',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'hsl(var(--primary))',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}>MA</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Marcus Aurelius</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>marcus@gmail.com</div>
                </div>
              </button>
            </div>

            {/* Custom Google Account inputs */}
            <div style={{ 
              borderTop: '1px solid rgba(255,255,255,0.06)', 
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>Or sign in with any Google account:</p>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="form-control" 
                  style={{ fontSize: '0.85rem', padding: '10px 14px' }}
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <input 
                  type="email" 
                  placeholder="Google Email (e.g. user@gmail.com)" 
                  className="form-control" 
                  style={{ fontSize: '0.85rem', padding: '10px 14px' }}
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}
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
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}
              onClick={() => { setShowGoogleMock(false); setErrorMsg(''); }}
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Normal Auth Modal content */
          <div>
            {/* Tabs for Login / Register */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '28px',
              gap: '16px'
            }}>
              <button
                onClick={() => { setIsRegister(false); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  paddingBottom: '12px',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: !isRegister ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                  borderBottom: !isRegister ? '2px solid hsl(var(--primary))' : 'none',
                  textAlign: 'center',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsRegister(true); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  paddingBottom: '12px',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: isRegister ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                  borderBottom: isRegister ? '2px solid hsl(var(--primary))' : 'none',
                  textAlign: 'center',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
            </div>

            {errorMsg && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'hsl(var(--danger))',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {errorMsg}
              </div>
            )}

            {/* Email form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isRegister && (
                <div className="form-group">
                  <label htmlFor="name-input">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'hsl(var(--text-muted))' }} />
                    <input 
                      type="text" 
                      id="name-input"
                      placeholder="Enter your name" 
                      className="form-control" 
                      style={{ paddingLeft: '44px', width: '100%' }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email-input">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'hsl(var(--text-muted))' }} />
                  <input 
                    type="email" 
                    id="email-input"
                    placeholder="you@example.com" 
                    className="form-control" 
                    style={{ paddingLeft: '44px', width: '100%' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label htmlFor="password-input">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'hsl(var(--text-muted))' }} />
                  <input 
                    type="password" 
                    id="password-input"
                    placeholder="••••••••" 
                    className="form-control" 
                    style={{ paddingLeft: '44px', width: '100%' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px', marginTop: '12px' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            {/* Separator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '24px 0',
              gap: '12px'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
            </div>

            {/* Google Sign-in button */}
            <button
              onClick={() => { setShowGoogleMock(true); setErrorMsg(''); }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid hsl(var(--border-color))',
                backgroundColor: 'rgba(255,255,255,0.02)',
                color: 'hsl(var(--text-primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              className="google-btn"
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--border-color))';
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

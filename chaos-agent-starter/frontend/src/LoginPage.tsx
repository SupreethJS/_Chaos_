import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock, Mail, Shield, User, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onSuccess: (user: { email: string; name?: string }) => void;
  onBack?: () => void;
}

export function LoginPage({ onSuccess, onBack }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('maya.lin@acme-cloud.io');
  const [password, setPassword] = useState('CipherSec2025!');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const cleanEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

  // Password criteria
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasCases = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const criteriaCount = [hasMinLength, hasNumber, hasSpecial, hasCases].filter(Boolean).length;

  // Resolve user full name dynamically instead of hardcoding
  const deriveNameFromEmail = (rawEmail: string, explicitName?: string): string => {
    if (explicitName && explicitName.trim().length > 0) {
      return explicitName.trim();
    }
    const normalized = rawEmail.trim().toLowerCase();
    if (normalized === 'maya.lin@acme-cloud.io') {
      return 'Maya Lin';
    }
    const prefix = normalized.split('@')[0] || '';
    if (!prefix) return 'Workspace User';
    const parts = prefix.split(/[._-]+/).filter(Boolean);
    if (parts.length === 0) return 'Workspace User';
    return parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!isEmailValid) {
      setToast({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }

    if (isSignUp) {
      if (password.length < 8) {
        setToast({ type: 'error', message: 'Password must be at least 8 characters long.' });
        return;
      }
      if (criteriaCount < 2) {
        setToast({ type: 'error', message: 'Please choose a stronger password meeting at least 2 security criteria.' });
        return;
      }
      if (!agreeTerms) {
        setToast({ type: 'error', message: 'Please agree to the Terms of Service to proceed.' });
        return;
      }
    } else {
      if (password.length < 6) {
        setToast({ type: 'error', message: 'Password must be at least 6 characters.' });
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const resolvedName = deriveNameFromEmail(cleanEmail, isSignUp ? name : undefined);
      setToast({
        type: 'success',
        message: isSignUp
          ? `Account created for ${resolvedName}! Entering workspace...`
          : `Signed in as ${resolvedName}! Entering workspace...`
      });
      setTimeout(() => {
        onSuccess({ email: cleanEmail, name: resolvedName });
      }, 500);
    }, 600);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setToast(null);
    setTimeout(() => {
      setLoading(false);
      const googleUser = {
        email: 'alex.chen@workplace.google.com',
        name: 'Alex Chen'
      };
      setToast({
        type: 'success',
        message: `Google identity verified (${googleUser.email})! Loading workspace...`
      });
      setTimeout(() => {
        onSuccess(googleUser);
      }, 500);
    }, 600);
  };

  const handleForgotPassword = () => {
    if (!isEmailValid) {
      setToast({ type: 'error', message: 'Enter your valid email address above to receive reset instructions.' });
      return;
    }
    setToast({
      type: 'success',
      message: `Password reset link dispatched to ${cleanEmail}. Please check your inbox.`
    });
  };

  const handleQuickDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ email: 'maya.lin@acme-cloud.io', name: 'Maya Lin' });
    }, 300);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 20%, #1e1b4b 0%, #0f172a 100%)',
      padding: '24px 16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        background: '#ffffff',
        borderRadius: 20,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        padding: '32px 28px',
        boxSizing: 'border-box'
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', padding: 4 }}
            >
              <ArrowLeft size={18} />
            </button>
          ) : <div style={{ width: 18 }} />}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#090d16',
              border: '1.5px solid rgba(56, 189, 248, 0.6)',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img src="/jarvis-logo.png" alt="JARVIS Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', letterSpacing: '-0.02em' }}>JARVIS</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>The Time Traveller</div>
            </div>
          </div>

          <span style={{ fontSize: 10, background: '#ecfdf5', color: '#065f46', padding: '3px 8px', borderRadius: 9999, fontWeight: 600 }}>
            256-bit AES
          </span>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 12, marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setToast(null); }}
            style={{
              flex: 1,
              padding: '9px 0',
              border: 'none',
              borderRadius: 9,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              background: !isSignUp ? '#ffffff' : 'transparent',
              color: !isSignUp ? '#4f46e5' : '#64748b',
              boxShadow: !isSignUp ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setToast(null); }}
            style={{
              flex: 1,
              padding: '9px 0',
              border: 'none',
              borderRadius: 9,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              background: isSignUp ? '#ffffff' : 'transparent',
              color: isSignUp ? '#4f46e5' : '#64748b',
              boxShadow: isSignUp ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease',
            marginBottom: 14
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0 16px 0', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>or with email</span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>

        {/* Toast Alert */}
        {toast && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 13,
            background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: toast.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            {toast.type === 'success' ? <Check size={16} /> : <Shield size={16} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isSignUp && (
            <div>
              <label htmlFor="signup-name" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#1e293b' }}>
                Full Name
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 12px', background: '#f8fafc' }}>
                <User size={16} color="#94a3b8" />
                <input
                  id="signup-name"
                  name="name"
                  autoComplete="name"
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '11px 10px', fontSize: 14, color: '#0f172a' }}
                />
              </div>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label htmlFor="login-email" style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Work Email</label>
              {isEmailValid && (
                <span style={{ fontSize: 11, color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Check size={12} /> Valid format
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 12px', background: '#f8fafc' }}>
              <Mail size={16} color="#94a3b8" />
              <input
                id="login-email"
                name="email"
                autoComplete="email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '11px 10px', fontSize: 14, color: '#0f172a' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label htmlFor="login-password" style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Password</label>
              {isSignUp && (
                <span style={{ fontSize: 11, fontWeight: 600, color: criteriaCount <= 1 ? '#ef4444' : criteriaCount === 2 ? '#f59e0b' : '#059669' }}>
                  {criteriaCount <= 1 ? 'Weak' : criteriaCount === 2 ? 'Fair' : criteriaCount === 3 ? 'Good' : 'Strong'} ({criteriaCount}/4)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 12px', background: '#f8fafc' }}>
              <Lock size={16} color="#94a3b8" />
              <input
                id="login-password"
                name="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '11px 10px', fontSize: 14, color: '#0f172a' }}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength indicators */}
            {isSignUp && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {[1, 2, 3, 4].map(idx => (
                    <div
                      key={idx}
                      style={{
                        height: 4,
                        flex: 1,
                        borderRadius: 2,
                        background: idx <= criteriaCount
                          ? criteriaCount <= 1 ? '#ef4444' : criteriaCount === 2 ? '#f59e0b' : '#10b981'
                          : '#e2e8f0',
                        transition: 'background 0.3s ease'
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11 }}>
                  <span style={{ color: hasMinLength ? '#059669' : '#94a3b8' }}>{hasMinLength ? '✓' : '•'} 8+ chars</span>
                  <span style={{ color: hasNumber ? '#059669' : '#94a3b8' }}>{hasNumber ? '✓' : '•'} Numbers</span>
                  <span style={{ color: hasSpecial ? '#059669' : '#94a3b8' }}>{hasSpecial ? '✓' : '•'} Special char</span>
                  <span style={{ color: hasCases ? '#059669' : '#94a3b8' }}>{hasCases ? '✓' : '•'} Upper & lower</span>
                </div>
              </div>
            )}
          </div>

          {!isSignUp && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
              <label htmlFor="remember-device" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', cursor: 'pointer' }}>
                <input
                  id="remember-device"
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={e => setRememberDevice(e.target.checked)}
                />
                <span>Remember this device</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#4f46e5',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {isSignUp && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#64748b', cursor: 'pointer', marginTop: 4 }}>
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>I acknowledge the Terms of Service and Privacy Policy</span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: '12px',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{loading ? 'Verifying Credentials...' : isSignUp ? 'Create Workspace Account' : 'Sign In to Workspace'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            style={{
              background: 'none',
              border: '1px dashed #cbd5e1',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 600,
              color: '#4f46e5',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sparkles size={14} />
            <span>Instant Demo Sign-In (Maya Lin)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

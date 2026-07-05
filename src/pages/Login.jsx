import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react';

// API_BASE is intentionally empty — Vite proxies /api/* → http://localhost:3001
// (see vite.config.ts server.proxy). This avoids CORS and ERR_CONNECTION_REFUSED.
const API_BASE = import.meta.env.DEV ? '' : 'https://my-portfolio.abdulahadbutt420.workers.dev';


export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username.trim(), password: form.password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Please try again.');
      } else {
        localStorage.setItem('aab_admin_token', data.token);
        navigate('/dashboard', { replace: true });
      }
    } catch {
      setError('Unable to reach the server. Ensure the backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #080d18 0%, #0d1526 50%, #080d18 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Login card */}
      <div
        className="animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(13, 21, 38, 0.9)',
          border: '1px solid rgba(30, 41, 59, 0.9)',
          borderRadius: '1.5rem',
          padding: '2.75rem',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(6,182,212,0.05)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{
            width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 0 24px rgba(6,182,212,0.35)',
          }}>
            <Zap size={22} color="#0a0f1a" />
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '1.5rem', color: '#f1f5f9',
            marginBottom: '0.35rem',
          }}>
            Portfolio Admin
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Secure access · AAB Dashboard
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '0.6rem', padding: '0.75rem 1rem',
            color: '#f87171', fontSize: '0.825rem', marginBottom: '1.5rem',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Username */}
          <div>
            <label style={{
              display: 'block', fontSize: '0.75rem', fontWeight: 600,
              color: '#94a3b8', marginBottom: '0.45rem', letterSpacing: '0.03em',
            }}>
              <User size={11} style={{ display: 'inline', marginRight: '0.3rem' }} />
              USERNAME
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Abdul Ahad Butt"
                autoComplete="username"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(30, 41, 59, 0.9)',
                  borderRadius: '0.625rem',
                  color: '#f1f5f9', fontSize: '0.9rem',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(6,182,212,0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(30, 41, 59, 0.9)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block', fontSize: '0.75rem', fontWeight: 600,
              color: '#94a3b8', marginBottom: '0.45rem', letterSpacing: '0.03em',
            }}>
              <Lock size={11} style={{ display: 'inline', marginRight: '0.3rem' }} />
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '0.75rem 2.75rem 0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(30, 41, 59, 0.9)',
                  borderRadius: '0.625rem',
                  color: '#f1f5f9', fontSize: '0.9rem',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(6,182,212,0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(30, 41, 59, 0.9)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: '0.85rem', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  transition: 'color 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseOut={e => e.currentTarget.style.color = '#64748b'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%', padding: '0.875rem',
              background: loading
                ? 'rgba(6,182,212,0.5)'
                : 'linear-gradient(135deg, #06b6d4, #0891b2)',
              border: 'none', borderRadius: '0.625rem',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
              boxShadow: '0 0 20px rgba(6,182,212,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onMouseOver={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 0 32px rgba(6,182,212,0.45)';
              }
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(6,182,212,0.3)';
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3"
                    strokeDasharray="60" strokeDashoffset="40" />
                </svg>
                Authenticating...
              </>
            ) : (
              <>
                <Lock size={16} />
                Sign In Securely
              </>
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '1.75rem',
          fontSize: '0.75rem', color: '#334155',
        }}>
          Protected admin access · Abdul Ahad Butt
        </p>
      </div>
    </div>
  );
}

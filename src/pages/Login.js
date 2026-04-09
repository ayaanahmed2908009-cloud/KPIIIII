import React, { useState } from 'react';
import { authenticate, saveSession } from '../auth/users';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const user = authenticate(username, password);
      if (user) {
        saveSession(user);
        onLogin(user);
      } else {
        setError('Incorrect username or password. Please try again.');
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '36px', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '0 0 40px #F59E0B40'
        }}>
          <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>SP</span>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', marginBottom: '4px' }}>
          SolarPak KPI Software
        </h1>
        <p style={{ fontSize: '14px', color: '#475569' }}>Sign in with your team credentials</p>
      </div>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: '14px', padding: '28px 24px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: '600',
                color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>Username</label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{
                  width: '100%', background: '#0f172a', border: '1px solid #334155',
                  borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0',
                  fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#F59E0B'}
                onBlur={e => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: '600',
                color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%', background: '#0f172a', border: '1px solid #334155',
                  borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0',
                  fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#F59E0B'}
                onBlur={e => e.target.style.borderColor = '#334155'}
              />
            </div>

            {error && (
              <div style={{
                background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px',
                padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#fca5a5'
              }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              style={{
                width: '100%', padding: '11px',
                background: loading || !username || !password
                  ? '#334155'
                  : 'linear-gradient(135deg, #F59E0B, #EF4444)',
                border: 'none', borderRadius: '8px',
                color: loading || !username || !password ? '#64748b' : '#fff',
                fontSize: '14px', fontWeight: '700',
                cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      <p style={{ marginTop: '24px', fontSize: '11px', color: '#1e293b' }}>
        SolarPak · KPI Software · {new Date().getFullYear()}
      </p>
    </div>
  );
}

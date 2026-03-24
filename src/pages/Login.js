import React, { useState } from 'react';
import { authenticate, saveSession } from '../auth/users';

const TEAM_COLORS = {
  ceo: '#F59E0B',
  general: '#8B5CF6',
  marketing: '#3B82F6',
  sponsorships: '#10B981',
  impactlabs: '#F59E0B',
  events: '#EF4444'
};

const ALL_ACCOUNTS = [
  { username: 'ceo',          password: 'solar2026',   label: 'CEO',                          role: 'Full access' },
  { username: 'general',      password: 'manage2026',  label: 'General Management',            role: 'Full access' },
  { username: 'marketing',    password: 'market2026',  label: 'Marketing & Social Media',      role: 'Team only' },
  { username: 'sponsorships', password: 'sponsor2026', label: 'Sponsorships & Fundraising',    role: 'Team only' },
  { username: 'impactlabs',   password: 'impact2026',  label: 'Impact Labs',                   role: 'Team only' },
  { username: 'events',       password: 'events2026',  label: 'Events & Community Outreach',   role: 'Team only' }
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

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

  const quickFill = (acc) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setError('');
  };

  const quickLogin = (acc) => {
    setLoading(true);
    setTimeout(() => {
      const user = authenticate(acc.username, acc.password);
      if (user) { saveSession(user); onLogin(user); }
      else setLoading(false);
    }, 200);
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

      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Quick access panel ─────────────────────────────── */}
        <div style={{
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: '14px', padding: '20px 22px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Quick Access
            </div>
            <button
              onClick={() => setShowPasswords(p => !p)}
              style={{
                background: showPasswords ? '#1e3a5f' : 'transparent',
                border: '1px solid #334155', borderRadius: '6px',
                padding: '3px 10px', color: showPasswords ? '#60a5fa' : '#475569',
                fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {showPasswords ? '🔒 Hide passwords' : '👁 Show passwords'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ALL_ACCOUNTS.map(acc => {
              const color = TEAM_COLORS[acc.username] || '#64748b';
              const isFullAccess = acc.role === 'Full access';
              return (
                <div
                  key={acc.username}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: '#0f172a', border: `1px solid ${color}20`,
                    borderRadius: '8px', padding: '9px 12px',
                    cursor: 'pointer', transition: 'border-color 0.15s'
                  }}
                  onClick={() => quickFill(acc)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = color + '60'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = color + '20'}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{
                        fontSize: '12px', color: '#e2e8f0', background: '#1e293b',
                        padding: '1px 7px', borderRadius: '4px', fontWeight: '600'
                      }}>{acc.username}</code>
                      {showPasswords && (
                        <code style={{
                          fontSize: '11px', color: '#64748b', background: '#1e293b',
                          padding: '1px 7px', borderRadius: '4px'
                        }}>{acc.password}</code>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                      {acc.label}
                      {isFullAccess && (
                        <span style={{
                          marginLeft: '6px', fontSize: '10px', fontWeight: '700',
                          color: '#F59E0B', background: '#F59E0B15',
                          padding: '1px 5px', borderRadius: '4px'
                        }}>FULL ACCESS</span>
                      )}
                    </div>
                  </div>

                  {/* One-click login button */}
                  <button
                    onClick={e => { e.stopPropagation(); quickLogin(acc); }}
                    disabled={loading}
                    style={{
                      background: color + '20', border: `1px solid ${color}40`,
                      borderRadius: '6px', padding: '4px 10px',
                      color: color, fontSize: '11px', fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', flexShrink: 0,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Login →
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#334155' }}>
            Click any row to fill the form, or press Login → for instant access.
          </div>
        </div>

        {/* ── Manual login form ─────────────────────────────── */}
        <div style={{
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: '14px', padding: '24px 22px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px' }}>
            Manual Sign In
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: '600',
                color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>Username</label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. marketing"
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

            <div style={{ marginBottom: '20px' }}>
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

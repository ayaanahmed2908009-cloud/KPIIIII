import React from 'react';
import { TEAM_COLORS } from '../data/kpiData';
import { canSeeAll } from '../auth/users';

export default function Navigation({ currentPage, onNavigate, currentUser, onLogout }) {
  const navItems = [
    { key: 'analytics', label: '📊 Analytics' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'heatmap', label: 'Risk Heatmap' },
    { key: 'directory', label: 'KPI Directory' }
  ];

  const roleColor = currentUser
    ? (canSeeAll(currentUser.role) ? '#F59E0B' : TEAM_COLORS[currentUser.role] || '#64748b')
    : '#64748b';

  return (
    <nav style={{
      background: '#0f172a',
      borderBottom: '1px solid #1e293b',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      height: '56px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '32px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '6px',
          background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', fontSize: '13px', color: '#fff'
        }}>SP</div>
        <span style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '15px', letterSpacing: '-0.01em' }}>
          SolarPak KPI
        </span>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              background: currentPage === item.key ? '#1e293b' : 'transparent',
              border: 'none',
              color: currentPage === item.key ? '#f1f5f9' : '#94a3b8',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: currentPage === item.key ? '600' : '400',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              borderBottom: currentPage === item.key ? '2px solid #F59E0B' : '2px solid transparent'
            }}
            onMouseEnter={e => { if (currentPage !== item.key) e.target.style.color = '#e2e8f0'; }}
            onMouseLeave={e => { if (currentPage !== item.key) e.target.style.color = '#94a3b8'; }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Logged-in user chip + logout */}
      {currentUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: roleColor + '15',
            border: `1px solid ${roleColor}30`,
            borderRadius: '999px',
            padding: '4px 12px 4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: roleColor }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: roleColor }}>
              {currentUser.label}
            </span>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'transparent',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '4px 12px',
              color: '#475569',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.target.style.color = '#94a3b8'; e.target.style.borderColor = '#334155'; }}
            onMouseLeave={e => { e.target.style.color = '#475569'; e.target.style.borderColor = '#1e293b'; }}
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}

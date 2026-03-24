import React, { useState } from 'react';
import { TEAM_LABELS, TEAM_COLORS, TEAM_INPUT_FIELDS, TEAM_KEYS } from '../data/kpiData';
import { getWeekFullLabel } from '../utils/fiscalYear';
import { TRIAL_WEEK_DATES } from '../data/seedData';

function getWeekDisplayLabel(weekNum) {
  if (weekNum < 1) {
    const info = TRIAL_WEEK_DATES[String(weekNum)];
    return info ? `${info.label} · ${info.dates} (Pre-FY Trial)` : `Trial Week · ${weekNum}`;
  }
  return getWeekFullLabel(weekNum);
}
import { getVisibleTeams, canSeeAll } from '../auth/users';

function FieldRow({ field, value }) {
  const isEmpty = value === 0 || value === null || value === undefined || value === '';
  const displayVal = value === null || value === undefined ? '—' : value;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '9px 0', borderBottom: '1px solid #1e293b'
    }}>
      <div style={{ flex: 1, paddingRight: '16px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{field.label}</div>
        {field.badge && (
          <span style={{
            fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '3px',
            background: '#1e293b', color: '#64748b', marginTop: '3px', display: 'inline-block'
          }}>{field.badge}</span>
        )}
      </div>
      <div style={{
        fontSize: '15px', fontWeight: '700', minWidth: '60px', textAlign: 'right',
        color: isEmpty ? '#334155' : '#f1f5f9'
      }}>
        {field.type === 'binary'
          ? (value === 1 ? '✓ Yes' : value === 0 ? '✗ No' : '—')
          : displayVal}
        {field.type === 'decimal' && !isEmpty && value > 0 && field.label.includes('%') ? '%' : ''}
      </div>
    </div>
  );
}

function TeamInputPanel({ teamKey, entry }) {
  const color = TEAM_COLORS[teamKey];
  const fields = TEAM_INPUT_FIELDS[teamKey] || [];

  if (!entry) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569', fontSize: '13px' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
        No data submitted for this week
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
        Submitted: {new Date(entry.dateSubmitted).toLocaleString('en-AU', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })}
      </div>
      {fields.map(field => (
        <FieldRow key={field.key} field={field} value={entry.inputs?.[field.key]} />
      ))}
    </div>
  );
}

export default function WeekInputModal({ weekNum, entries, currentUser, onClose }) {
  const visibleTeams = getVisibleTeams(currentUser?.role);
  const seesAll = canSeeAll(currentUser?.role);
  const [activeTab, setActiveTab] = useState(visibleTeams[0]);

  // Build a map: teamKey → entry
  const entryMap = {};
  (entries || []).forEach(e => { entryMap[e.team] = e; });

  const submittedCount = visibleTeams.filter(t => entryMap[t]).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f172a', border: '1px solid #334155',
          borderRadius: '16px', width: '100%', maxWidth: '640px',
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #1e293b',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#f1f5f9' }}>
              {getWeekDisplayLabel(weekNum)}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
              {submittedCount}/{visibleTeams.length} team{visibleTeams.length !== 1 ? 's' : ''} submitted
              {submittedCount === 0 && ' · No data entered this week'}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
            width: '32px', height: '32px', color: '#94a3b8', fontSize: '16px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>×</button>
        </div>

        {/* Team tabs (only shown for CEO/GM with multiple teams) */}
        {seesAll && (
          <div style={{
            display: 'flex', gap: '4px', padding: '12px 24px 0',
            borderBottom: '1px solid #1e293b', overflowX: 'auto'
          }}>
            {visibleTeams.map(t => {
              const submitted = !!entryMap[t];
              const color = TEAM_COLORS[t];
              const isActive = activeTab === t;
              return (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  background: isActive ? color + '20' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                  padding: '8px 14px', borderRadius: '6px 6px 0 0',
                  cursor: 'pointer', fontSize: '11px', fontWeight: isActive ? '700' : '400',
                  color: isActive ? color : '#475569',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <span style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: submitted ? color : '#334155', flexShrink: 0
                  }} />
                  {TEAM_LABELS[t].split(' ')[0]}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {seesAll ? (
            <TeamInputPanel teamKey={activeTab} entry={entryMap[activeTab]} />
          ) : (
            <TeamInputPanel teamKey={visibleTeams[0]} entry={entryMap[visibleTeams[0]]} />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #1e293b',
          display: 'flex', gap: '8px', justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
            padding: '8px 20px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer'
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}

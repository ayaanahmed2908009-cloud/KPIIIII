import React, { useState, useMemo } from 'react';
import { KPI_DIRECTORY, TEAM_KEYS } from '../data/kpiData';
import { getVisibleTeams, canSeeAll } from '../auth/users';

const frequencyBadge = (frequency) => {
  const f = frequency.includes('Monthly') ? 'Monthly' : frequency.includes('Quarterly') ? 'Quarterly' : frequency.includes('Event') ? 'Event-triggered' : 'Weekly';
  const styles = {
    Monthly: { bg: '#2a1f3b', fg: '#a78bfa' },
    Quarterly: { bg: '#1a3a2a', fg: '#34d399' },
    'Event-triggered': { bg: '#3b1f1f', fg: '#f87171' },
    Weekly: { bg: '#1e3a5f', fg: '#60a5fa' }
  };
  const s = styles[f] || styles.Weekly;
  return { label: f, bg: s.bg, fg: s.fg };
};

function KPICard({ kpi, teamColor }) {
  const badge = frequencyBadge(kpi.frequency);
  return (
    <div style={{
      background: '#1e293b', border: `1px solid ${teamColor}20`,
      borderLeft: `3px solid ${teamColor}`, borderRadius: '8px',
      padding: '16px 18px', marginBottom: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontWeight: '700', fontSize: '14px', color: '#f1f5f9' }}>{kpi.name}</span>
        <span style={{
          fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px',
          background: badge.bg, color: badge.fg, textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>{badge.label}</span>
      </div>

      <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.6' }}>{kpi.description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        {[
          { label: 'Year 1 Target', value: kpi.targets.year1, color: '#60a5fa' },
          { label: 'Year 2 Target', value: kpi.targets.year2, color: '#a78bfa' },
          { label: 'Year 3 Target', value: kpi.targets.year3, color: '#f472b6' }
        ].map(t => (
          <div key={t.label} style={{ background: '#0f172a', borderRadius: '6px', padding: '8px 12px' }}>
            <div style={{ fontSize: '10px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', marginBottom: '3px' }}>{t.label}</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: t.color }}>{t.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ background: '#0f172a', borderRadius: '6px', padding: '10px 12px' }}>
          <div style={{ fontSize: '10px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Weekly Input Fields</div>
          {kpi.feedingFields.map((f, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#64748b', marginBottom: '3px', display: 'flex', gap: '6px' }}>
              <span style={{ color: teamColor, marginTop: '1px' }}>→</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#0f172a', borderRadius: '6px', padding: '10px 12px' }}>
          <div style={{ fontSize: '10px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>How Probability Is Calculated</div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>{kpi.probabilityCalc}</p>
        </div>
      </div>
    </div>
  );
}

export default function KPIDirectory({ currentUser }) {
  const [search, setSearch] = useState('');
  const visibleTeams = getVisibleTeams(currentUser.role);
  const isFullAccess = canSeeAll(currentUser.role);

  // Default filter: if team lead, pre-select their team; allow changing only if full access
  const [filter, setFilter] = useState(isFullAccess ? 'all' : currentUser.role);

  const teamCounts = TEAM_KEYS.reduce((acc, k) => {
    acc[k] = KPI_DIRECTORY[k].kpis.length;
    return acc;
  }, {});
  const visibleCount = visibleTeams.reduce((acc, k) => acc + (teamCounts[k] || 0), 0);
  const totalCount = Object.values(teamCounts).reduce((a, b) => a + b, 0);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TEAM_KEYS
      .filter(k => visibleTeams.includes(k))
      .filter(k => filter === 'all' || filter === k)
      .map(k => {
        const team = KPI_DIRECTORY[k];
        const kpis = team.kpis.filter(kpi =>
          !q || kpi.name.toLowerCase().includes(q) || kpi.description.toLowerCase().includes(q)
        );
        return { key: k, ...team, kpis };
      })
      .filter(t => t.kpis.length > 0);
  }, [search, filter, visibleTeams]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Policy banner */}
      <div style={{
        background: '#1c1917', border: '1px solid #78716c',
        borderRadius: '10px', padding: '16px 20px', marginBottom: '28px',
        display: 'flex', gap: '12px'
      }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>📋</span>
        <div>
          <div style={{ fontWeight: '700', fontSize: '13px', color: '#e7e5e4', marginBottom: '4px' }}>KPI Policy Notice</div>
          <p style={{ fontSize: '13px', color: '#a8a29e', margin: 0, lineHeight: '1.6' }}>
            All KPI targets are valid from <strong style={{ color: '#e7e5e4' }}>April 2026</strong>. Targets are reviewed as needed by the founder.
            A sustained probability below 50% for 6 consecutive weeks will trigger a formal leadership review.
          </p>
        </div>
      </div>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', marginBottom: '6px' }}>KPI Directory</h1>
          <div style={{ fontSize: '13px', color: '#475569' }}>
            {isFullAccess
              ? `${totalCount} KPIs across ${TEAM_KEYS.length} teams`
              : `${visibleCount} KPIs for your team`}
          </div>
        </div>

        {/* Team summary pills — only show visible teams */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {visibleTeams.map(k => (
            <div key={k} style={{
              background: KPI_DIRECTORY[k].color + '15',
              border: `1px solid ${KPI_DIRECTORY[k].color}30`,
              borderRadius: '999px', padding: '4px 12px',
              fontSize: '12px', color: KPI_DIRECTORY[k].color, fontWeight: '600'
            }}>
              {teamCounts[k]} KPIs
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search KPIs by name or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1', minWidth: '240px',
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0',
            fontSize: '13px', fontFamily: 'inherit', outline: 'none'
          }}
          onFocus={e => e.target.style.borderColor = '#F59E0B'}
          onBlur={e => e.target.style.borderColor = '#334155'}
        />
        {/* Only show team filter dropdown if user has access to more than one team */}
        {visibleTeams.length > 1 && (
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0',
              fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', minWidth: '200px'
            }}
          >
            <option value="all">All Teams</option>
            {visibleTeams.map(k => (
              <option key={k} value={k}>{KPI_DIRECTORY[k].label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Results */}
      {filteredData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#475569', fontSize: '14px' }}>
          No KPIs match your search.
        </div>
      ) : (
        filteredData.map(team => (
          <div key={team.key} style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
              paddingBottom: '12px', borderBottom: `2px solid ${team.color}40`
            }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: team.color }} />
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: team.color, margin: 0 }}>{team.label}</h2>
              <span style={{ fontSize: '12px', color: '#475569' }}>{team.kpis.length} KPI{team.kpis.length !== 1 ? 's' : ''}</span>
            </div>
            {team.kpis.map((kpi, i) => (
              <KPICard key={i} kpi={kpi} teamColor={team.color} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

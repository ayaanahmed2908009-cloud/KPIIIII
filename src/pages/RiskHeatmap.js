import React from 'react';
import { KPI_DIRECTORY, TEAM_KEYS } from '../data/kpiData';
import { getConsecutiveBelowWeeks, formatDate } from '../utils/analysisHelpers';
import { getVisibleTeams } from '../auth/users';

function getCellStyle(probability, insufficient) {
  if (insufficient) return { bg: '#1e293b', fg: '#475569', border: '#334155' };
  if (probability >= 70) return { bg: '#064e3b', fg: '#34d399', border: '#065f46' };
  if (probability >= 50) return { bg: '#451a03', fg: '#fbbf24', border: '#78350f' };
  return { bg: '#450a0a', fg: '#f87171', border: '#7f1d1d' };
}

function getRiskLabel(probability, insufficient) {
  if (insufficient) return 'No data';
  if (probability >= 70) return 'On Track';
  if (probability >= 50) return 'At Risk';
  return 'Critical';
}

export default function RiskHeatmap({ analysisHistory, currentUser }) {
  const latestEntry = analysisHistory.length > 0 ? analysisHistory[analysisHistory.length - 1] : null;
  const latestAnalysis = latestEntry?.analysis;
  const visibleTeams = getVisibleTeams(currentUser.role);

  if (!latestAnalysis) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h2 style={{ color: '#f1f5f9', fontWeight: '700', marginBottom: '8px' }}>No Analysis Data Yet</h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Submit at least one week of inputs, then ask General Management or the CEO to run the AI Analysis.
        </p>
      </div>
    );
  }

  // Build summary counts for visible teams only
  let onTrack = 0, atRisk = 0, critical = 0, insufficient = 0;

  const teamData = TEAM_KEYS
    .filter(k => visibleTeams.includes(k))
    .map(teamKey => {
      const teamDef = KPI_DIRECTORY[teamKey];
      const teamAnalysis = latestAnalysis[teamKey];
      const kpiResults = teamDef.kpis.map(kpiDef => {
        const found = teamAnalysis?.kpis?.find(k => k.name === kpiDef.name);
        const probability = found?.probability ?? null;
        const riskFlag = found?.riskFlag ?? null;
        if (probability === null) insufficient++;
        else if (probability >= 70) onTrack++;
        else if (probability >= 50) atRisk++;
        else critical++;
        return { ...kpiDef, probability, riskFlag, isInsufficient: probability === null };
      });
      const consecutiveBelow = getConsecutiveBelowWeeks(analysisHistory, teamKey);
      return { teamKey, teamDef, kpiResults, consecutiveBelow, overallProb: teamAnalysis?.overallProbability };
    });

  const totalKPIs = onTrack + atRisk + critical + insufficient;
  const gridCols = visibleTeams.length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', marginBottom: '4px' }}>Risk Heatmap</h1>
        <div style={{ fontSize: '13px', color: '#475569' }}>
          Last analysis: {latestEntry?.dateRun ? formatDate(latestEntry.dateRun) : 'Unknown'} · Week {latestEntry?.weekNumber}
          {visibleTeams.length < TEAM_KEYS.length && (
            <span style={{ marginLeft: '10px', color: '#64748b' }}>— showing your team only</span>
          )}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {[
          { label: 'On Track', count: onTrack, bg: '#064e3b', fg: '#34d399' },
          { label: 'At Risk', count: atRisk, bg: '#451a03', fg: '#fbbf24' },
          { label: 'Critical', count: critical, bg: '#450a0a', fg: '#f87171' },
          { label: 'No Data', count: insufficient, bg: '#1e293b', fg: '#475569' }
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.fg}30`,
            borderRadius: '8px', padding: '10px 18px',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '22px', fontWeight: '800', color: s.fg }}>{s.count}</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: s.fg }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: s.fg + '80' }}>
                {totalKPIs > 0 ? Math.round(s.count / totalKPIs * 100) : 0}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: '12px',
        overflowX: 'auto'
      }}>
        {teamData.map(({ teamKey, teamDef, kpiResults, consecutiveBelow, overallProb }) => (
          <div key={teamKey} style={{ minWidth: '180px' }}>
            <div style={{
              background: teamDef.color + '15', border: `1px solid ${teamDef.color}30`,
              borderRadius: '8px 8px 0 0', padding: '12px 14px', marginBottom: '2px'
            }}>
              <div style={{ fontWeight: '700', fontSize: '12px', color: teamDef.color, lineHeight: '1.3' }}>
                {teamDef.label}
              </div>
              {overallProb !== undefined && (
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9', marginTop: '4px' }}>{overallProb}%</div>
              )}
              {consecutiveBelow >= 4 && (
                <div style={{ fontSize: '11px', marginTop: '4px', color: consecutiveBelow >= 6 ? '#f87171' : '#fbbf24' }}>
                  {consecutiveBelow >= 6 ? '🚨' : '⚠️'} {consecutiveBelow}w below 50%
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {kpiResults.map((kpi, i) => {
                const style = getCellStyle(kpi.probability, kpi.isInsufficient);
                const warningLevel = !kpi.isInsufficient && kpi.probability < 50 ? consecutiveBelow : 0;
                return (
                  <div key={i} style={{
                    background: style.bg, border: `1px solid ${style.border}`,
                    borderRadius: '4px', padding: '10px 12px', position: 'relative'
                  }}>
                    <div style={{ fontSize: '11px', color: style.fg, fontWeight: '500', lineHeight: '1.3' }}>
                      {kpi.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: style.fg }}>
                        {kpi.probability !== null ? `${kpi.probability}%` : '—'}
                      </span>
                      <span style={{ fontSize: '10px', color: style.fg + '90' }}>
                        {getRiskLabel(kpi.probability, kpi.isInsufficient)}
                      </span>
                    </div>
                    {warningLevel >= 4 && (
                      <div style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '12px' }}>
                        {warningLevel >= 6 ? '🚨' : '⚠️'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '28px', padding: '16px 20px',
        background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
        display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center'
      }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Legend:</span>
        {[
          { color: '#34d399', label: 'On Track (≥70%)' },
          { color: '#fbbf24', label: 'At Risk (50–69%)' },
          { color: '#f87171', label: 'Critical (<50%)' },
          { color: '#475569', label: 'No Data' }
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color + '40', border: `1px solid ${l.color}` }} />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{l.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>⚠️</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>4–5 weeks approaching warning</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>🚨</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>6+ weeks — leadership review triggered</span>
        </div>
      </div>
    </div>
  );
}

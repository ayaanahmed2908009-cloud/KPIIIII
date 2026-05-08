import React, { useState } from 'react';
import { TEAM_LABELS, TEAM_COLORS, TEAM_KEYS } from '../data/kpiData';
import { getExecutiveScore, scoreColor, riskColor, riskBg, formatDate, getLeadershipWarnings } from '../utils/analysisHelpers';

function TeamVerdict({ overallProb }) {
  if (overallProb >= 75) return (
    <span style={{ color: '#34d399', fontWeight: '700', fontSize: '13px' }}>
      ✓ Likely to meet Year 1 targets
    </span>
  );
  if (overallProb >= 55) return (
    <span style={{ color: '#fbbf24', fontWeight: '700', fontSize: '13px' }}>
      ⚡ At risk — targeted intervention needed
    </span>
  );
  return (
    <span style={{ color: '#f87171', fontWeight: '700', fontSize: '13px' }}>
      ✗ Unlikely to meet Year 1 targets without significant change
    </span>
  );
}

function KPIRow({ kpi }) {
  const fg = riskColor(kpi.riskFlag, kpi.probability);
  const bg = riskBg(kpi.riskFlag, kpi.probability);
  return (
    <tr style={{ borderBottom: '1px solid #0f172a' }}>
      <td style={{ padding: '9px 12px', color: '#e2e8f0', fontSize: '13px' }}>{kpi.name}</td>
      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: '50px', height: '26px', borderRadius: '6px',
          background: fg + '20', color: fg, fontWeight: '700', fontSize: '13px', padding: '0 8px'
        }}>
          {kpi.probability}%
        </div>
      </td>
      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
        <span style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
          background: bg, color: fg, fontSize: '11px', fontWeight: '600', textTransform: 'capitalize'
        }}>
          {kpi.riskFlag === 'on track' ? '✓ On Track' : kpi.riskFlag === 'at risk' ? '⚡ At Risk' : '🔴 Critical'}
        </span>
      </td>
      <td style={{ padding: '9px 12px', color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>{kpi.rationale}</td>
    </tr>
  );
}

function TeamReport({ teamKey, teamData, warnings }) {
  const [expanded, setExpanded] = useState(true);
  const color = TEAM_COLORS[teamKey];
  const label = TEAM_LABELS[teamKey];
  const overallProb = teamData?.overallProbability ?? 0;
  const isWarning = warnings.includes(teamKey);

  return (
    <div style={{
      border: `1px solid ${color}30`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '10px',
      marginBottom: '20px',
      background: '#1e293b',
      overflow: 'hidden'
    }}>
      {/* Team header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px 20px', display: 'flex', alignItems: 'center',
          gap: '16px', cursor: 'pointer',
          borderBottom: expanded ? `1px solid ${color}15` : 'none'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: '15px', color: color }}>{label}</span>
            {isWarning && (
              <span style={{
                fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                background: '#7f1d1d', color: '#fca5a5', borderRadius: '999px'
              }}>🚨 LEADERSHIP REVIEW</span>
            )}
            {teamData?.low_confidence && (
              <span style={{
                fontSize: '11px', fontWeight: '600', padding: '2px 8px',
                background: '#1c1917', color: '#a8a29e', borderRadius: '999px'
              }}>Low confidence</span>
            )}
          </div>
          <TeamVerdict overallProb={overallProb} />
        </div>

        {/* Probability dial */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: `conic-gradient(${scoreColor(overallProb)} ${overallProb * 3.6}deg, #0f172a ${overallProb * 3.6}deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, position: 'relative'
        }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%',
            background: '#1e293b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '17px', fontWeight: '800', color: scoreColor(overallProb), lineHeight: 1 }}>
              {overallProb}
            </span>
            <span style={{ fontSize: '10px', color: '#475569' }}>/ 100</span>
          </div>
        </div>

        <span style={{ color: '#475569', fontSize: '16px' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '20px' }}>
          {/* Diagnosis */}
          {teamData?.diagnosis && (
            <div style={{
              background: '#0f172a', borderLeft: `3px solid ${color}`,
              borderRadius: '0 8px 8px 0', padding: '14px 18px', marginBottom: '20px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                AI Diagnosis
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.75', margin: 0 }}>
                {teamData.diagnosis}
              </p>
            </div>
          )}

          {/* Team advice */}
          {teamData?.teamAdvice?.length > 0 && (
            <div style={{
              background: '#0c1a2e', border: `1px solid ${color}25`, borderLeft: `3px solid ${color}`,
              borderRadius: '0 8px 8px 0', padding: '14px 18px', marginBottom: '20px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
                AI Advice for team lead
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {teamData.teamAdvice.map((tip, i) => (
                  <li key={i} style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* KPI table */}
          {teamData?.kpis?.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>KPI</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', color: '#475569', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>Probability</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', color: '#475569', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {teamData.kpis.map((kpi, i) => <KPIRow key={i} kpi={kpi} />)}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalysisReport({ analysisEntry, analysisHistory, onClose }) {
  const { analysis, weekNumber, dateRun } = analysisEntry;
  const execScore = getExecutiveScore(analysis);
  const warnings = getLeadershipWarnings(analysisHistory);

  // Overall organisation verdict
  const orgVerdict = execScore >= 70
    ? { text: 'SolarPak is broadly on track to meet its Year 1 targets.', color: '#34d399', icon: '✓' }
    : execScore >= 50
    ? { text: 'SolarPak is at risk of missing one or more Year 1 targets — focused action is required.', color: '#fbbf24', icon: '⚡' }
    : { text: 'SolarPak is currently unlikely to meet its Year 1 targets — leadership review recommended.', color: '#f87171', icon: '✗' };

  // Count KPIs by status
  let onTrackCount = 0, atRiskCount = 0, criticalCount = 0;
  TEAM_KEYS.forEach(team => {
    analysis[team]?.kpis?.forEach(kpi => {
      if (kpi.probability >= 70) onTrackCount++;
      else if (kpi.probability >= 50) atRiskCount++;
      else criticalCount++;
    });
  });
  const totalKPIs = onTrackCount + atRiskCount + criticalCount;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)',
      overflow: 'auto',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '900px', margin: '0 auto',
        padding: '40px 24px 80px'
      }}>

        {/* Report header */}
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '14px',
          padding: '32px 36px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                SolarPak · Confidential KPI Briefing
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f1f5f9', marginBottom: '4px', lineHeight: 1.2 }}>
                Year 1 Target Analysis
              </h1>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                Week {weekNumber} of 52 · Generated {formatDate(dateRun)}
              </div>

              {/* Overall verdict */}
              <div style={{
                background: orgVerdict.color + '10',
                border: `1px solid ${orgVerdict.color}30`,
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>{orgVerdict.icon}</span>
                <p style={{ color: orgVerdict.color, fontWeight: '600', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                  {orgVerdict.text}
                </p>
              </div>
            </div>

            {/* Executive score */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{
                width: '110px', height: '110px', borderRadius: '50%',
                background: `conic-gradient(${scoreColor(execScore)} ${execScore * 3.6}deg, #0f172a ${execScore * 3.6}deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px',
                boxShadow: `0 0 30px ${scoreColor(execScore)}40`
              }}>
                <div style={{
                  width: '84px', height: '84px', borderRadius: '50%',
                  background: '#1e293b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '28px', fontWeight: '900', color: scoreColor(execScore), lineHeight: 1 }}>
                    {execScore}
                  </span>
                  <span style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>/ 100</span>
                </div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>
                Exec Score
              </div>
            </div>
          </div>

          {/* KPI summary bar */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #0f172a' }}>
            <div style={{ fontSize: '12px', color: '#475569', marginBottom: '12px', fontWeight: '600' }}>
              Organisation-wide KPI breakdown ({totalKPIs} KPIs assessed)
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'On Track', count: onTrackCount, color: '#34d399', bg: '#064e3b' },
                { label: 'At Risk', count: atRiskCount, color: '#fbbf24', bg: '#451a03' },
                { label: 'Critical', count: criticalCount, color: '#f87171', bg: '#450a0a' }
              ].map(s => (
                <div key={s.label} style={{
                  background: s.bg, border: `1px solid ${s.color}30`,
                  borderRadius: '8px', padding: '8px 16px',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: s.color }}>{s.count}</span>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: s.color }}>{s.label}</div>
                    <div style={{ fontSize: '10px', color: s.color + '70' }}>
                      {totalKPIs > 0 ? Math.round(s.count / totalKPIs * 100) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: '14px', height: '8px', borderRadius: '4px', background: '#0f172a', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(onTrackCount / totalKPIs) * 100}%`, background: '#34d399', transition: 'width 0.5s' }} />
              <div style={{ width: `${(atRiskCount / totalKPIs) * 100}%`, background: '#fbbf24', transition: 'width 0.5s' }} />
              <div style={{ width: `${(criticalCount / totalKPIs) * 100}%`, background: '#f87171', transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>

        {/* Leadership warnings */}
        {warnings.length > 0 && (
          <div style={{
            background: '#7f1d1d', border: '1px solid #ef4444',
            borderRadius: '10px', padding: '16px 20px', marginBottom: '24px'
          }}>
            <div style={{ fontWeight: '700', color: '#fca5a5', fontSize: '14px', marginBottom: '8px' }}>
              🚨 Leadership Review Triggered
            </div>
            {warnings.map(team => (
              <div key={team} style={{ color: '#fecaca', fontSize: '13px', marginBottom: '4px' }}>
                • <strong>{TEAM_LABELS[team]}</strong>: below 50% probability for 6+ consecutive weeks.
              </div>
            ))}
          </div>
        )}

        {/* Per-team sections */}
        <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Team-by-Team Breakdown
        </div>
        {TEAM_KEYS.map(teamKey => (
          <TeamReport
            key={teamKey}
            teamKey={teamKey}
            teamData={analysis[teamKey]}
            warnings={warnings}
          />
        ))}

        {/* Close / print actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px' }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: '11px 28px', borderRadius: '8px',
              border: '1px solid #334155', background: 'transparent',
              color: '#94a3b8', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            🖨 Print / Save PDF
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '11px 36px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              color: '#fff', fontSize: '13px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}

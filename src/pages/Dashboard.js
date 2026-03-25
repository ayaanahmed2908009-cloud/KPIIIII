import React, { useState } from 'react';
import { TEAM_KEYS, TEAM_LABELS, TEAM_COLORS, TEAM_INPUT_FIELDS, DEFAULT_WEEK_INPUTS } from '../data/kpiData';
import {
  getLeadershipWarnings, getExecutiveScore, scoreColor,
  riskColor, riskBg, formatDate, getCurrentWeekNumber, getConsecutiveBelowWeeks
} from '../utils/analysisHelpers';
import { exportHistory, clearAll } from '../utils/storage';
import { getVisibleTeams, canSeeAll } from '../auth/users';
import WeekTimeline from '../components/WeekTimeline';
import { getCurrentFiscalWeek, getWeekShortLabel, FISCAL_START } from '../utils/fiscalYear';

// ─── Executive Score Card ──────────────────────────────────────────────────────
function ExecutiveScoreCard({ score, analysisDate, weekNumber }) {
  const color = scoreColor(score);
  const status = score === null ? 'No analysis run yet' : score >= 70 ? 'On Track' : score >= 50 ? 'At Risk' : 'Critical';
  return (
    <div style={{
      background: '#1e293b', border: `1px solid ${score !== null ? color + '40' : '#334155'}`,
      borderRadius: '12px', padding: '24px 32px',
      display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '24px'
    }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          Executive Score {weekNumber ? `— Week ${weekNumber}` : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '56px', fontWeight: '800', color, lineHeight: 1 }}>{score !== null ? score : '—'}</span>
          {score !== null && <span style={{ fontSize: '24px', color: '#475569' }}>/100</span>}
        </div>
        <div style={{ marginTop: '6px', display: 'inline-block', padding: '2px 10px', borderRadius: '999px', background: color + '20', color, fontSize: '12px', fontWeight: '600' }}>{status}</div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>Last analysis</div>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>{analysisDate ? formatDate(analysisDate) : 'Never'}</div>
        <div style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>Composite of all 5 teams' avg KPI probabilities</div>
      </div>
    </div>
  );
}

// ─── Leadership Warning Banners ────────────────────────────────────────────────
function LeadershipWarnings({ warnings, visibleTeams }) {
  const relevant = warnings.filter(t => visibleTeams.includes(t));
  if (!relevant.length) return null;
  return (
    <div style={{ marginBottom: '24px' }}>
      {relevant.map(team => (
        <div key={team} style={{
          background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '8px',
          padding: '12px 20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '18px' }}>🚨</span>
          <div>
            <span style={{ fontWeight: '700', color: '#fca5a5' }}>{TEAM_LABELS[team]}: </span>
            <span style={{ color: '#fecaca', fontSize: '14px' }}>
              Leadership review triggered — this team has been below 50% probability for 6 consecutive weeks.
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Probability Table (for analysis tab) ─────────────────────────────────
function KPITable({ kpis, diagnosis, lowConfidence }) {
  if (!kpis || kpis.length === 0) return null;
  return (
    <div style={{ marginTop: '16px' }}>
      {lowConfidence && (
        <div style={{ background: '#1c1917', border: '1px solid #78716c', borderRadius: '6px', padding: '8px 14px', marginBottom: '12px', fontSize: '12px', color: '#a8a29e' }}>
          ⚠️ Low confidence — fewer than 4 weeks of data. Estimates are indicative only.
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1e293b' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>KPI</th>
            <th style={{ padding: '8px 12px', textAlign: 'center', color: '#475569', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>Prob.</th>
            <th style={{ padding: '8px 12px', textAlign: 'center', color: '#475569', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>Rationale</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi, i) => {
            const fg = riskColor(kpi.riskFlag, kpi.probability);
            const bg = riskBg(kpi.riskFlag, kpi.probability);
            return (
              <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                <td style={{ padding: '10px 12px', color: '#e2e8f0', fontWeight: '500' }}>{kpi.name}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '28px', borderRadius: '6px', background: fg + '20', color: fg, fontWeight: '700', fontSize: '13px' }}>{kpi.probability}%</div>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '999px', background: bg, color: fg, fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {kpi.riskFlag === 'on track' ? '✓ On Track' : kpi.riskFlag === 'at risk' ? '⚡ At Risk' : '🔴 Critical'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>{kpi.rationale}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {diagnosis && (
        <div style={{ marginTop: '16px', background: '#0f172a', borderLeft: '3px solid #334155', borderRadius: '0 8px 8px 0', padding: '14px 18px' }}>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>AI Diagnosis</div>
          <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>{diagnosis}</p>
        </div>
      )}
    </div>
  );
}

// ─── Read-only view of a single team's submitted inputs for one week ───────────
function TeamInputCard({ teamKey, submission, onViewPrevious, hasPrevious }) {
  const color = TEAM_COLORS[teamKey];
  const label = TEAM_LABELS[teamKey];
  const fields = TEAM_INPUT_FIELDS[teamKey];

  if (!submission) {
    return (
      <div style={{
        background: '#1e293b', border: `1px solid #1e293b`,
        borderLeft: `4px solid ${color}30`, borderRadius: '10px',
        padding: '20px 24px', marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color + '40' }} />
          <span style={{ fontWeight: '600', fontSize: '15px', color: '#64748b' }}>{label}</span>
        </div>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
            No inputs entered for this week.
          </div>
          {hasPrevious && (
            <button
              onClick={onViewPrevious}
              style={{
                background: 'transparent', border: `1px solid ${color}40`,
                borderRadius: '6px', padding: '6px 14px', color: color,
                fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              ← View previous week's inputs
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#1e293b', border: `1px solid ${color}20`,
      borderLeft: `4px solid ${color}`, borderRadius: '10px',
      padding: '20px 24px', marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
        <span style={{ fontWeight: '600', fontSize: '15px', color: '#f1f5f9' }}>{label}</span>
        <span style={{ fontSize: '12px', color: '#475569', marginLeft: 'auto' }}>
          Submitted {formatDate(submission.dateSubmitted)}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
        {fields.map(field => {
          const val = submission.inputs?.[field.key];
          const isEmpty = val === 0 || val === undefined || val === null;
          return (
            <div key={field.key} style={{
              background: '#0f172a', borderRadius: '6px', padding: '8px 12px',
              border: `1px solid ${isEmpty ? '#1e293b' : color + '20'}`
            }}>
              <div style={{ fontSize: '11px', color: '#475569', marginBottom: '3px', lineHeight: '1.4' }}>
                {field.label}
                {field.badge && (
                  <span style={{
                    marginLeft: '5px', fontSize: '9px', padding: '1px 5px', borderRadius: '999px',
                    background: field.badge === 'QUARTERLY' ? '#1e3a5f' : '#3b1f1f',
                    color: field.badge === 'QUARTERLY' ? '#60a5fa' : '#f87171', fontWeight: '600'
                  }}>{field.badge}</span>
                )}
              </div>
              <div style={{
                fontSize: '16px', fontWeight: '700',
                color: isEmpty ? '#334155' : '#f1f5f9'
              }}>
                {field.type === 'binary'
                  ? (val === 1 ? <span style={{ color: '#34d399' }}>Yes</span> : <span style={{ color: '#475569' }}>No</span>)
                  : (val !== undefined && val !== null ? val.toLocaleString() : '—')
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week navigator ────────────────────────────────────────────────────────────
function WeekNavigator({ availableWeeks, selectedWeek, onSelect }) {
  const idx = availableWeeks.indexOf(selectedWeek);
  const canPrev = idx < availableWeeks.length - 1;
  const canNext = idx > 0;

  const btnStyle = (enabled) => ({
    background: '#1e293b', border: '1px solid #334155', borderRadius: '6px',
    padding: '6px 14px', color: enabled ? '#e2e8f0' : '#334155',
    fontSize: '13px', fontWeight: '600', cursor: enabled ? 'pointer' : 'not-allowed',
    fontFamily: 'inherit'
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
      <button style={btnStyle(canPrev)} disabled={!canPrev}
        onClick={() => canPrev && onSelect(availableWeeks[idx + 1])}>← Prev</button>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '6px 20px', minWidth: '120px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>Viewing</div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>Week {selectedWeek}</div>
      </div>

      <button style={btnStyle(canNext)} disabled={!canNext}
        onClick={() => canNext && onSelect(availableWeeks[idx - 1])}>Next →</button>

      <div style={{ marginLeft: '8px' }}>
        <select
          value={selectedWeek}
          onChange={e => onSelect(Number(e.target.value))}
          style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: '6px',
            padding: '6px 10px', color: '#94a3b8', fontSize: '12px',
            fontFamily: 'inherit', cursor: 'pointer'
          }}
        >
          {availableWeeks.map(w => (
            <option key={w} value={w}>Week {w}</option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: '12px', color: '#475569', marginLeft: '4px' }}>
        {availableWeeks.length} week{availableWeeks.length !== 1 ? 's' : ''} of data
      </div>
    </div>
  );
}

// ─── Team Overview: read-only view of all teams' inputs for a week ─────────────
function TeamOverview({ history, teamsToShow }) {
  const allWeeks = [...new Set(history.map(e => e.weekNumber))].sort((a, b) => b - a);
  const [selectedWeek, setSelectedWeek] = useState(allWeeks[0] ?? 1);

  if (allWeeks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
        <div style={{ fontSize: '15px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>No inputs submitted yet</div>
        <div style={{ fontSize: '13px', color: '#475569' }}>Team leads need to submit their weekly inputs first.</div>
      </div>
    );
  }

  return (
    <div>
      <WeekNavigator availableWeeks={allWeeks} selectedWeek={selectedWeek} onSelect={setSelectedWeek} />
      {teamsToShow.map(teamKey => {
        const submission = history.find(e => e.weekNumber === selectedWeek && e.team === teamKey);
        const hasPrevious = history.some(e => e.weekNumber < selectedWeek && e.team === teamKey);
        return (
          <TeamInputCard
            key={teamKey}
            teamKey={teamKey}
            submission={submission}
            hasPrevious={hasPrevious}
            onViewPrevious={() => {
              const prev = [...new Set(history.filter(e => e.team === teamKey && e.weekNumber < selectedWeek).map(e => e.weekNumber))].sort((a, b) => b - a);
              if (prev[0]) setSelectedWeek(prev[0]);
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Weekly Input Form ─────────────────────────────────────────────────────────
function WeeklyInputForm({ teamKey, onChange }) {
  const fields = TEAM_INPUT_FIELDS[teamKey];
  const color = TEAM_COLORS[teamKey];
  const defaults = DEFAULT_WEEK_INPUTS[teamKey];
  // Local string state so users can type freely without being snapped back to 0
  const [local, setLocal] = useState(() => {
    const init = {};
    fields.forEach(f => { init[f.key] = String(defaults[f.key] ?? 0); });
    return init;
  });

  const handleChange = (field, rawVal) => {
    setLocal(prev => ({ ...prev, [field.key]: rawVal }));
    const num = field.type === 'decimal' ? parseFloat(rawVal) : parseInt(rawVal);
    onChange(field.key, isNaN(num) ? 0 : num);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
      {fields.map(field => (
        <div key={field.key}>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: '500' }}>
            {field.label}
            {field.badge && (
              <span style={{
                marginLeft: '6px', fontSize: '10px', padding: '1px 6px', borderRadius: '999px',
                background: field.badge === 'QUARTERLY' ? '#1e3a5f' : '#3b1f1f',
                color: field.badge === 'QUARTERLY' ? '#60a5fa' : '#f87171', fontWeight: '600'
              }}>{field.badge}</span>
            )}
          </label>
          {field.type === 'binary' ? (
            <select
              value={local[field.key] ?? '0'}
              onChange={e => handleChange(field, e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '8px 10px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              <option value="0">0 — No</option>
              <option value="1">1 — Yes</option>
            </select>
          ) : (
            <input
              type="number"
              step={field.type === 'decimal' ? '0.1' : '1'}
              value={local[field.key] ?? ''}
              onChange={e => handleChange(field, e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '8px 10px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = color}
              onBlur={e => e.target.style.borderColor = '#1e293b'}
            />
          )}
          {field.note && <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{field.note}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Own-team section (for team leads and GM's own-inputs tab) ─────────────────
function OwnTeamSection({ teamKey, teamInputs, onInputChange, onSubmitTeam, latestAnalysis, analysisHistory, lastSubmission }) {
  const [collapsed, setCollapsed] = useState(false);
  const [formTab, setFormTab] = useState('form');
  const [submitKey, setSubmitKey] = useState(0);
  const color = TEAM_COLORS[teamKey];
  const label = TEAM_LABELS[teamKey];
  const teamAnalysis = latestAnalysis?.[teamKey];
  const overallProb = teamAnalysis?.overallProbability;
  const consecutiveBelow = getConsecutiveBelowWeeks(analysisHistory, teamKey);

  return (
    <div style={{ background: '#1e293b', border: `1px solid ${color}30`, borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
      <div onClick={() => setCollapsed(!collapsed)} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', cursor: 'pointer', borderBottom: collapsed ? 'none' : `1px solid ${color}20` }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, marginRight: '12px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '15px', color: '#f1f5f9' }}>{label}</div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Last submission: {lastSubmission ? formatDate(lastSubmission) : 'No submissions yet'}</div>
        </div>
        {overallProb !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            {consecutiveBelow >= 4 && <span>{consecutiveBelow >= 6 ? '🚨' : '⚠️'}</span>}
            <div style={{ padding: '4px 14px', borderRadius: '999px', background: scoreColor(overallProb) + '20', color: scoreColor(overallProb), fontWeight: '700', fontSize: '14px' }}>{overallProb}%</div>
          </div>
        ) : (
          <div style={{ marginRight: '16px', fontSize: '12px', color: '#475569' }}>No analysis yet</div>
        )}
        <span style={{ color: '#475569', fontSize: '18px', userSelect: 'none' }}>{collapsed ? '▶' : '▼'}</span>
      </div>

      {!collapsed && (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[{ key: 'form', label: 'Weekly Input' }, { key: 'analysis', label: `Analysis ${teamAnalysis ? '✓' : ''}` }].map(tab => (
              <button key={tab.key} onClick={() => setFormTab(tab.key)} style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none',
                background: formTab === tab.key ? color + '20' : 'transparent',
                color: formTab === tab.key ? color : '#64748b',
                fontSize: '13px', fontWeight: formTab === tab.key ? '600' : '400',
                cursor: 'pointer', fontFamily: 'inherit',
                borderBottom: formTab === tab.key ? `2px solid ${color}` : '2px solid transparent'
              }}>{tab.label}</button>
            ))}
          </div>
          {formTab === 'form' && (
            <>
              <WeeklyInputForm key={submitKey} teamKey={teamKey} onChange={(key, val) => onInputChange(teamKey, key, val)} />
              <button
                onClick={() => { onSubmitTeam(teamKey); setSubmitKey(k => k + 1); }}
                style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '8px', border: 'none', background: color, color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >Submit {label} Data</button>
            </>
          )}
          {formTab === 'analysis' && (
            teamAnalysis
              ? <KPITable kpis={teamAnalysis.kpis} diagnosis={teamAnalysis.diagnosis} lowConfidence={teamAnalysis.low_confidence} />
              : <div style={{ color: '#475569', fontSize: '14px', padding: '24px', textAlign: 'center' }}>No analysis results yet. Submit data first, then ask General Management or the CEO to run the analysis.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
export default function Dashboard({ history, analysisHistory, onAddEntry, onRunAnalysis, isAnalysing, currentUser }) {
  const latestAnalysis = analysisHistory.length > 0 ? analysisHistory[analysisHistory.length - 1]?.analysis : null;
  const latestAnalysisEntry = analysisHistory.length > 0 ? analysisHistory[analysisHistory.length - 1] : null;
  const warnings = getLeadershipWarnings(analysisHistory);
  const currentWeekNumber = getCurrentWeekNumber(history);
  const isCeo = currentUser.role === 'ceo';
  const isGM = currentUser.role === 'generalManagement';
  const isTeamLead = !isCeo && !isGM;

  const execScore = (isCeo || isGM) ? getExecutiveScore(latestAnalysis) : null;

  const fiscalWeek = getCurrentFiscalWeek(); // 0 = not started, 1–52 = live week
  const [weekOverride, setWeekOverride] = useState('');
  // Default form week: use fiscal week if started, else fall back to history-based number
  const effectiveWeek = weekOverride
    ? parseInt(weekOverride)
    : (fiscalWeek > 0 ? fiscalWeek : currentWeekNumber);

  // GM tab state
  const [gmTab, setGmTab] = useState('myInputs'); // 'myInputs' | 'teamOverview'

  const [inputs, setInputs] = useState(() => {
    const init = {};
    TEAM_KEYS.forEach(k => { init[k] = { ...DEFAULT_WEEK_INPUTS[k] }; });
    return init;
  });

  const handleInputChange = (team, key, val) => {
    setInputs(prev => ({ ...prev, [team]: { ...prev[team], [key]: val } }));
  };

  const handleSubmitTeam = (teamKey) => {
    onAddEntry(effectiveWeek, teamKey, inputs[teamKey]);
    setInputs(prev => ({ ...prev, [teamKey]: { ...DEFAULT_WEEK_INPUTS[teamKey] } }));
  };

  const lastSubmissionPerTeam = {};
  TEAM_KEYS.forEach(team => {
    const entries = history.filter(e => e.team === team);
    lastSubmissionPerTeam[team] = entries.length > 0 ? entries[entries.length - 1].dateSubmitted : null;
  });

  // ── CEO View ────────────────────────────────────────────────────────────────
  if (isCeo) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <LeadershipWarnings warnings={warnings} visibleTeams={TEAM_KEYS} />
        <ExecutiveScoreCard score={execScore} analysisDate={latestAnalysisEntry?.dateRun} weekNumber={latestAnalysisEntry?.weekNumber} />

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9' }}>All Teams — Input Overview</div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>Read-only view of submitted weekly data</div>
          </div>
          {onRunAnalysis && (
            <button onClick={onRunAnalysis} disabled={isAnalysing || history.length === 0} style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              background: isAnalysing ? '#334155' : 'linear-gradient(135deg, #F59E0B, #EF4444)',
              color: isAnalysing || history.length === 0 ? '#64748b' : '#fff',
              fontSize: '13px', fontWeight: '700', cursor: isAnalysing || history.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}>{isAnalysing ? '⏳ Running...' : '🤖 Run AI Analysis'}</button>
          )}
          <button onClick={() => exportHistory(history, analysisHistory)} disabled={history.length === 0} style={{
            padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155',
            background: 'transparent', color: '#94a3b8', fontSize: '13px',
            cursor: history.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
          }}>↓ Export JSON</button>
          <button onClick={() => { if (window.confirm('Clear all history and analysis? This cannot be undone.')) { clearAll(); window.location.reload(); } }} style={{
            padding: '10px 16px', borderRadius: '8px', border: '1px solid #7f1d1d',
            background: 'transparent', color: '#ef4444', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit'
          }}>Reset All</button>
        </div>

        <WeekTimeline history={history} currentUser={currentUser} />
        <TeamOverview history={history} teamsToShow={TEAM_KEYS} />
      </div>
    );
  }

  // ── General Management View ─────────────────────────────────────────────────
  if (isGM) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <LeadershipWarnings warnings={warnings} visibleTeams={TEAM_KEYS} />
        <ExecutiveScoreCard score={execScore} analysisDate={latestAnalysisEntry?.dateRun} weekNumber={latestAnalysisEntry?.weekNumber} />

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }} />
          {onRunAnalysis && (
            <button onClick={onRunAnalysis} disabled={isAnalysing || history.length === 0} style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              background: isAnalysing ? '#334155' : 'linear-gradient(135deg, #F59E0B, #EF4444)',
              color: isAnalysing || history.length === 0 ? '#64748b' : '#fff',
              fontSize: '13px', fontWeight: '700', cursor: isAnalysing || history.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}>{isAnalysing ? '⏳ Running...' : '🤖 Run AI Analysis'}</button>
          )}
          <button onClick={() => exportHistory(history, analysisHistory)} disabled={history.length === 0} style={{
            padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155',
            background: 'transparent', color: '#94a3b8', fontSize: '13px',
            cursor: history.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
          }}>↓ Export JSON</button>
          <button onClick={() => { if (window.confirm('Clear all history and analysis? This cannot be undone.')) { clearAll(); window.location.reload(); } }} style={{
            padding: '10px 16px', borderRadius: '8px', border: '1px solid #7f1d1d',
            background: 'transparent', color: '#ef4444', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit'
          }}>Reset All</button>
        </div>

        {/* GM Tab Switcher */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: '#1e293b', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          {[
            { key: 'myInputs', label: '📝 My Team Inputs' },
            { key: 'teamOverview', label: '👁 All Teams Overview' }
          ].map(tab => (
            <button key={tab.key} onClick={() => setGmTab(tab.key)} style={{
              padding: '8px 20px', borderRadius: '7px', border: 'none',
              background: gmTab === tab.key ? '#0f172a' : 'transparent',
              color: gmTab === tab.key ? '#f1f5f9' : '#64748b',
              fontSize: '13px', fontWeight: gmTab === tab.key ? '700' : '400',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
            }}>{tab.label}</button>
          ))}
        </div>

        {/* GM — My Inputs tab */}
        {gmTab === 'myInputs' && (
          <div>
            <WeekTimeline history={history} currentUser={currentUser} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '13px', color: '#64748b' }}>Submitting for week:</label>
              <input type="number" min="1" max="52" placeholder={String(effectiveWeek)} value={weekOverride} onChange={e => setWeekOverride(e.target.value)} style={{ width: '64px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'inherit' }} />
              {fiscalWeek > 0 && (
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  · {getWeekShortLabel(effectiveWeek)}
                  {fiscalWeek > 0 && effectiveWeek !== fiscalWeek && (
                    <span style={{ color: '#F59E0B' }}> (current: Wk {fiscalWeek})</span>
                  )}
                </span>
              )}
              {fiscalWeek === 0 && (
                <span style={{ fontSize: '12px', color: '#60a5fa' }}>
                  · FY starts {FISCAL_START.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
            <OwnTeamSection
              teamKey="generalManagement"
              teamInputs={inputs.generalManagement}
              onInputChange={handleInputChange}
              onSubmitTeam={handleSubmitTeam}
              latestAnalysis={latestAnalysis}
              analysisHistory={analysisHistory}
              lastSubmission={lastSubmissionPerTeam.generalManagement}
            />
          </div>
        )}

        {/* GM — All Teams Overview tab */}
        {gmTab === 'teamOverview' && (
          <TeamOverview history={history} teamsToShow={TEAM_KEYS} />
        )}
      </div>
    );
  }

  // ── Team Lead View ──────────────────────────────────────────────────────────
  const visibleTeams = getVisibleTeams(currentUser.role);
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <LeadershipWarnings warnings={warnings} visibleTeams={visibleTeams} />

      {/* Team lead welcome card */}
      <div style={{
        background: '#1e293b', border: `1px solid ${TEAM_COLORS[currentUser.role]}30`,
        borderRadius: '12px', padding: '20px 28px', marginBottom: '24px'
      }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Your team</div>
        <div style={{ fontSize: '22px', fontWeight: '800', color: TEAM_COLORS[currentUser.role] }}>{TEAM_LABELS[currentUser.role]}</div>
        <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>Submit your weekly inputs below. The AI analysis is run by General Management or the CEO.</div>
      </div>

      {/* Week timeline */}
      <WeekTimeline history={history} currentUser={currentUser} />

      {/* Week selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '13px', color: '#64748b' }}>Submitting for week:</label>
        <input type="number" min="1" max="52" placeholder={String(effectiveWeek)} value={weekOverride} onChange={e => setWeekOverride(e.target.value)} style={{ width: '64px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'inherit' }} />
        {fiscalWeek > 0 && (
          <span style={{ fontSize: '12px', color: '#475569' }}>
            · {getWeekShortLabel(effectiveWeek)}
            {effectiveWeek !== fiscalWeek && (
              <span style={{ color: '#F59E0B' }}> (current: Wk {fiscalWeek})</span>
            )}
          </span>
        )}
        {fiscalWeek === 0 && (
          <span style={{ fontSize: '12px', color: '#60a5fa' }}>
            · FY starts {FISCAL_START.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>

      {visibleTeams.map(teamKey => (
        <OwnTeamSection
          key={teamKey}
          teamKey={teamKey}
          teamInputs={inputs[teamKey]}
          onInputChange={handleInputChange}
          onSubmitTeam={handleSubmitTeam}
          latestAnalysis={latestAnalysis}
          analysisHistory={analysisHistory}
          lastSubmission={lastSubmissionPerTeam[teamKey]}
        />
      ))}
    </div>
  );
}

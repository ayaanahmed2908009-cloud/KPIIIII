import React, { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import { EmptyChartState } from './ChartShared';

const TEAM_COLORS = {
  marketing: '#3B82F6',
  sponsorships: '#10B981',
  generalManagement: '#8B5CF6',
  impactLabs: '#F59E0B',
  events: '#EC4899',
};

const TEAM_LABELS = {
  marketing: 'Marketing',
  sponsorships: 'Sponsorships',
  generalManagement: 'General Mgmt',
  impactLabs: 'Impact Labs',
  events: 'Events',
};

function getCompositeProb(analysisHistory) {
  if (!analysisHistory || analysisHistory.length === 0) return null;
  const latest = analysisHistory[analysisHistory.length - 1];
  if (!latest?.analysis) return null;
  const teams = ['marketing', 'sponsorships', 'generalManagement', 'impactLabs', 'events'];
  const probs = teams.map(t => latest.analysis[t]?.overallProbability).filter(p => p != null);
  if (probs.length === 0) return null;
  return Math.round(probs.reduce((s, p) => s + p, 0) / probs.length);
}

function getTeamProbs(analysisHistory) {
  if (!analysisHistory || analysisHistory.length === 0) return null;
  const latest = analysisHistory[analysisHistory.length - 1];
  if (!latest?.analysis) return null;
  const teams = ['marketing', 'sponsorships', 'generalManagement', 'impactLabs', 'events'];
  const result = {};
  teams.forEach(t => {
    result[t] = latest.analysis[t]?.overallProbability ?? null;
  });
  return result;
}

export function AIConfidenceBriefing({ history, analysisHistory }) {
  const [expanded, setExpanded] = useState(false);

  const aiProbs = getTeamProbs(analysisHistory);
  const compositeFromAI = getCompositeProb(analysisHistory);

  // No AI analysis run yet — show empty state
  if (compositeFromAI === null) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '1px solid #6366f1',
        borderTop: '4px solid #6366f1',
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#f1f5f9' }}>AI Overall Confidence Briefing</span>
          <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: '#1e3a5f', color: '#60a5fa' }}>
            🤖 AI
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
          Composite target achievement probability across all 5 SolarPak teams
        </div>
        <EmptyChartState message="Run AI Analysis to generate your executive confidence briefing" />
      </div>
    );
  }

  const probs = aiProbs;
  const composite = compositeFromAI;
  const teams = ['marketing', 'sponsorships', 'generalManagement', 'impactLabs', 'events'];

  const radarData = teams.map(t => ({
    team: TEAM_LABELS[t],
    probability: probs?.[t] ?? 0,
    fullMark: 100,
  }));

  const compositeColor = composite >= 70 ? '#34d399' : composite >= 50 ? '#fbbf24' : '#f87171';
  const verdict = composite >= 70 ? 'On Track' : composite >= 50 ? 'At Risk' : 'Critical Risk';
  const verdictColor = compositeColor;

  const weakTeams = teams.filter(t => (probs?.[t] ?? 0) < 50);
  const strongTeams = teams.filter(t => (probs?.[t] ?? 0) >= 70);

  const dialPct = composite / 100;
  const dialAngle = dialPct * 180 - 90;
  const dialRad = (dialAngle * Math.PI) / 180;
  const R = 60;
  const cx = 80, cy = 70;
  const nx = cx + (R - 10) * Math.cos(dialRad);
  const ny = cy + (R - 10) * Math.sin(dialRad);

  function arc(startPct, endPct, r) {
    const s = startPct * 180 - 90;
    const e = endPct * 180 - 90;
    const x1 = cx + r * Math.cos((s * Math.PI) / 180);
    const y1 = cy + r * Math.sin((s * Math.PI) / 180);
    const x2 = cx + r * Math.cos((e * Math.PI) / 180);
    const y2 = cy + r * Math.sin((e * Math.PI) / 180);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      border: '1px solid #6366f1',
      borderTop: '4px solid #6366f1',
      borderRadius: '14px',
      padding: '24px',
      marginBottom: '28px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#f1f5f9' }}>
              AI Overall Confidence Briefing
            </span>
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: '#1e3a5f', color: '#60a5fa' }}>
              🤖 AI
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Composite target achievement probability across all 5 SolarPak teams
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{
          background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
          padding: '6px 14px', fontSize: '12px', color: '#94a3b8', cursor: 'pointer'
        }}>
          {expanded ? 'Collapse ▲' : 'Expand ▼'}
        </button>
      </div>

      {/* Main composite score + team bars */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Dial */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <svg width={160} height={100} viewBox="0 0 160 100">
            <path d={arc(0, 0.5, R)} stroke="#EF4444" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d={arc(0.5, 0.7, R)} stroke="#F59E0B" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d={arc(0.7, 1, R)} stroke="#10B981" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.7" />
            <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="6" fill="#f1f5f9" />
            <text x={cx} y={cy + 18} textAnchor="middle" fill={compositeColor} fontSize="20" fontWeight="800">
              {composite}%
            </text>
            <text x={cx} y={cy + 32} textAnchor="middle" fill="#475569" fontSize="10">
              composite
            </text>
          </svg>
          <div style={{
            background: verdictColor + '20', border: `1px solid ${verdictColor}50`,
            borderRadius: '8px', padding: '6px 14px', marginTop: '4px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: verdictColor }}>{verdict}</div>
          </div>
        </div>

        {/* Team probability bars */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>Per-team probability</div>
          {teams.map(t => {
            const prob = probs?.[t] ?? 0;
            const c = prob >= 70 ? '#34d399' : prob >= 50 ? '#fbbf24' : '#f87171';
            return (
              <div key={t} style={{ marginBottom: '7px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TEAM_COLORS[t], display: 'inline-block' }} />
                    {TEAM_LABELS[t]}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: c }}>{prob}%</span>
                </div>
                <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${prob}%`, background: c, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight text */}
      <div style={{
        background: '#0f172a', border: `1px solid ${verdictColor}40`,
        borderLeft: `3px solid ${verdictColor}`,
        borderRadius: '0 8px 8px 0', padding: '12px 16px', marginTop: '16px'
      }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: verdictColor, textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.06em' }}>
          🤖 Executive Briefing · {verdict}
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
          Based on this week's inputs, SolarPak's cumulative probability of meeting all Year 1 targets is {composite}%. {weakTeams.length > 0 ? `⚠ ${weakTeams.map(t => TEAM_LABELS[t]).join(' and ')} ${weakTeams.length === 1 ? 'is' : 'are'} below 50% — escalate to leadership immediately.` : '✓ All teams are above the 50% risk threshold.'} {strongTeams.length > 0 ? `${strongTeams.map(t => TEAM_LABELS[t]).join(' and ')} ${strongTeams.length === 1 ? 'is' : 'are'} leading the organisation at ≥70%.` : ''}
        </div>
      </div>

      {/* Expanded: radar chart */}
      {expanded && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '12px' }}>Team capability radar</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <ResponsiveContainer width="50%" height={200}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="team" tick={{ fill: '#475569', fontSize: 10 }} />
                <Radar name="Probability" dataKey="probability" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#475569', marginBottom: '10px' }}>Target threshold analysis</div>
              {teams.map(t => {
                const prob = probs?.[t] ?? 0;
                const gap = 70 - prob;
                return (
                  <div key={t} style={{ marginBottom: '8px', padding: '8px 12px', background: '#0f172a', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{TEAM_LABELS[t]}</span>
                      <span style={{ fontSize: '11px', color: prob >= 70 ? '#34d399' : '#f87171' }}>
                        {prob >= 70 ? `+${prob - 70} above target` : `${Math.abs(gap)} below target`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

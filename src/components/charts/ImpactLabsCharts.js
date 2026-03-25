import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ChartCard, DarkTooltip, AIInsightBox, StatPill, CHART_DEFAULTS, EmptyChartState } from './ChartShared';
import { pacePoint, hasEnoughData, extractTeamData } from '../../data/placeholderData';

const COLOR = '#F59E0B';

function buildData(history) {
  if (!hasEnoughData(history, 'impactLabs')) return { data: [], isEmpty: true };
  const raw = extractTeamData(history, 'impactLabs');
  const data = raw.map(e => ({
    week: e.weekNumber,
    research: e.inputs.articlesResearchStage || 0,
    draft: e.inputs.articlesDraftStage || 0,
    review: e.inputs.articlesReviewStage || 0,
    publishedWeek: e.inputs.articlesPublishedThisWeek || 0,
    publishedYTD: e.inputs.totalArticlesPublishedYTD || 0,
    aiScore: e.inputs.aiQualityScore || 0,
    dataPoints: e.inputs.dataPointsVerified || 0,
    auditScore: e.inputs.dataAccuracyAuditScore || 0,
    citations: e.inputs.externalCitationsConfirmed || 0,
    submitted: e.inputs.findingsSubmittedExternally || 0,
    reportPct: e.inputs.annualReportPercentComplete || 0,
  }));
  return { data, isEmpty: false };
}

// 1 — Article Production Pipeline
export function ArticlePipelineChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Article Production Pipeline" subtitle="Live stage snapshot — articles currently in each phase" color={COLOR}><EmptyChartState /></ChartCard>;

  const latest = data[data.length - 1];
  const stages = [
    { label: 'Research', value: latest?.research || 0, color: '#60a5fa', icon: '🔍' },
    { label: 'Draft', value: latest?.draft || 0, color: '#a78bfa', icon: '✏️' },
    { label: 'Review', value: latest?.review || 0, color: '#fbbf24', icon: '🔎' },
    { label: 'Published YTD', value: latest?.publishedYTD || 0, color: '#34d399', icon: '✅' },
  ];
  const inProgress = (latest?.research || 0) + (latest?.draft || 0) + (latest?.review || 0);

  return (
    <ChartCard title="Article Production Pipeline" subtitle="Live stage snapshot — articles currently in each phase" color={COLOR}
      insight={`${inProgress} articles in progress · ${latest?.publishedYTD || 0}/8 published YTD (target). ${8 - (latest?.publishedYTD || 0)} more needed.`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        {stages.map((s, i) => (
          <div key={i} style={{
            background: '#0f172a', border: `1px solid ${s.color}30`,
            borderLeft: `3px solid ${s.color}`,
            borderRadius: '8px', padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Pipeline flow bar */}
      <div style={{ display: 'flex', gap: '2px', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
        {stages.slice(0, 3).map((s, i) => (
          <div key={i} style={{
            flex: s.value,
            background: s.color,
            minWidth: s.value > 0 ? '8px' : 0,
            transition: 'flex 0.5s'
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
        {stages.slice(0, 3).map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: '10px', color: '#475569' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

// 2 — Publication Pace vs. Target
export function PublicationPaceChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Publication Pace vs. Annual Target" subtitle="Cumulative articles published (step) · dashed = required pace to hit 8" color={COLOR}><EmptyChartState /></ChartCard>;

  const chartData = data.map(d => ({ ...d, pace: pacePoint(d.week, 8) }));
  const latest = data[data.length - 1];
  const weeklyRate = latest?.publishedYTD && data.length > 0 ? (latest.publishedYTD / data.length).toFixed(2) : 0;
  const projectedByWeek52 = parseFloat((weeklyRate * 52).toFixed(0));

  return (
    <ChartCard title="Publication Pace vs. Annual Target" subtitle="Cumulative articles published (step) · dashed = required pace to hit 8" color={COLOR}
      insight={`${latest?.publishedYTD || 0}/8 articles published. At current rate (${weeklyRate}/week), projected year-end total: ${projectedByWeek52}. ${projectedByWeek52 >= 8 ? '✓ On track.' : `⚠ ${8 - projectedByWeek52} short of target.`}`}>
      <ResponsiveContainer width="100%" height={190}>
        <ComposedChart data={chartData} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 9]} />
          <Tooltip content={<DarkTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <ReferenceLine y={8} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target 8', fill: '#10B981', fontSize: 10 }} />
          <Area type="stepAfter" dataKey="publishedYTD" stroke={COLOR} fill={COLOR + '30'} strokeWidth={2.5} name="Published YTD" dot={{ r: 4, fill: COLOR }} />
          <Line type="monotone" dataKey="pace" stroke="#334155" strokeDasharray="5 3" strokeWidth={1.5} dot={false} name="Required pace" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 3 — Report Quality Score Trend
export function ReportQualityChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Report Quality AI Score Trend" subtitle="Non-zero weekly scores · green band = ≥85 target · avg rolling line" color={COLOR}><EmptyChartState /></ChartCard>;

  const scoreData = data.filter(d => d.aiScore > 0).map(d => ({ week: d.week, score: d.aiScore }));
  const avgScore = scoreData.length > 0
    ? parseFloat((scoreData.reduce((s, d) => s + d.score, 0) / scoreData.length).toFixed(1))
    : 0;

  return (
    <ChartCard title="Report Quality AI Score Trend" subtitle="Non-zero weekly scores · green band = ≥85 target · avg rolling line" color={COLOR}
      insight={scoreData.length > 0
        ? `${scoreData.length} reports reviewed. Average quality score: ${avgScore}/100. ${avgScore >= 85 ? '✓ Above 85% threshold.' : `⚠ ${(85 - avgScore).toFixed(1)} points below target.`} ${scoreData.filter(d => d.score >= 85).length}/${scoreData.length} reports met threshold.`
        : 'No reports reviewed yet. Submit AI quality scores in weekly input form.'}>
      {scoreData.length === 0 ? (
        <EmptyChartState message="Enter quality scores when reviewing reports" />
      ) : (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <StatPill label="Avg score" value={`${avgScore}`} color={avgScore >= 85 ? '#34d399' : '#f87171'} />
            <StatPill label="Above 85" value={`${scoreData.filter(d => d.score >= 85).length}/${scoreData.length}`} color={COLOR} />
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <ComposedChart data={scoreData} margin={CHART_DEFAULTS.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `Wk ${v}`} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[60, 100]} />
              <Tooltip content={<DarkTooltip />} />
              <ReferenceLine y={85} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target 85', fill: '#10B981', fontSize: 10 }} />
              <ReferenceLine y={avgScore} stroke={COLOR} strokeDasharray="3 2" strokeWidth={1} label={{ value: `Avg ${avgScore}`, fill: COLOR, fontSize: 9, position: 'right' }} />
              <Area type="monotone" dataKey="score" stroke={COLOR} fill={COLOR + '20'} strokeWidth={2.5} name="Quality Score" dot={{ r: 5, fill: COLOR }} />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      )}
    </ChartCard>
  );
}

// 4 — Annual Report Progress
export function AnnualReportProgress({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Annual Impact Report Progress" subtitle="Monthly update · milestones tracked · AI pace estimate" color={COLOR}><EmptyChartState /></ChartCard>;

  const updates = data.filter(d => d.reportPct > 0);
  const latest = updates[updates.length - 1];
  const pct = latest?.reportPct || 0;
  const color = pct >= 70 ? '#34d399' : pct >= 40 ? '#fbbf24' : '#f87171';
  const weeksElapsed = latest?.week || 0;
  const updateRate = weeksElapsed > 0 ? (pct / weeksElapsed) : 0;
  const weeksToComplete = updateRate > 0 ? Math.ceil((100 - pct) / updateRate) : '—';
  const estimatedWeek = typeof weeksToComplete === 'number' ? weeksElapsed + weeksToComplete : '—';

  const milestones = [
    { pct: 25, label: 'Research complete' },
    { pct: 50, label: 'First draft' },
    { pct: 75, label: 'Review stage' },
    { pct: 100, label: 'Published' },
  ];

  return (
    <ChartCard title="Annual Impact Report Progress" subtitle="Monthly update · milestones tracked · AI pace estimate" color={COLOR}
      insight={`Report is ${pct}% complete. ${updateRate > 0 ? `At current pace (+${updateRate.toFixed(1)}%/week), estimated completion: Week ${estimatedWeek} of 52.` : 'Update the report % monthly to track pace.'}`}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Progress</span>
          <span style={{ fontSize: '18px', fontWeight: '800', color }}>{pct}%</span>
        </div>
        <div style={{ position: 'relative', height: '28px', background: '#0f172a', borderRadius: '8px', overflow: 'visible' }}>
          <div style={{
            height: '100%', width: `${pct}%`, background: `linear-gradient(to right, ${color}80, ${color})`,
            borderRadius: '8px', transition: 'width 0.8s ease', position: 'relative'
          }}>
            {pct > 5 && (
              <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: '700', color: '#fff' }}>
                {pct}%
              </div>
            )}
          </div>
          {milestones.map(m => (
            <div key={m.pct} style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${m.pct}%`, width: '2px',
              background: pct >= m.pct ? color + '80' : '#334155',
              transform: 'translateX(-1px)'
            }}>
              <div style={{
                position: 'absolute', top: '100%', marginTop: '4px',
                left: '50%', transform: 'translateX(-50%)',
                fontSize: '9px', color: pct >= m.pct ? color : '#334155',
                whiteSpace: 'nowrap'
              }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
      {updates.length > 1 && (
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={updates} margin={{ top: 2, right: 5, left: -25, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v => `Wk${v}`} />
            <YAxis tick={{ fill: '#475569', fontSize: 9 }} domain={[0, 100]} />
            <Tooltip content={<DarkTooltip formatter={(v) => v + '%'} />} />
            <Area type="monotone" dataKey="reportPct" stroke={COLOR} fill={COLOR + '20'} strokeWidth={2} name="Report %" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
      <AIInsightBox
        verdict={pct >= 75 ? 'Final Stretch' : pct >= 50 ? 'On Track' : pct >= 25 ? 'Early Stage' : 'Just Started'}
        verdictColor={color}
        text={`At ${pct}% completion${estimatedWeek !== '—' ? `, estimated Week ${estimatedWeek} delivery` : ''}. ${pct < 25 ? 'Focus on completing the research and data gathering phase before drafting begins.' : pct < 50 ? 'Priority: complete the first full draft. Assign dedicated writing blocks each week.' : pct < 75 ? 'Enter review phase — circulate draft to stakeholders for feedback.' : 'Final review and publication. Confirm external submission dates.'}`}
      />
    </ChartCard>
  );
}

// 5 — External Reach Combo
export function ExternalReachChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="External Reach — Citations & Submissions" subtitle="Bars = weekly activity · line = cumulative citations" color={COLOR}><EmptyChartState /></ChartCard>;

  let cumCitations = 0;
  const chartData = data.map(d => {
    cumCitations += d.citations;
    return { ...d, cumCitations };
  });
  const totalSubmissions = data.filter(d => d.submitted === 1).length;
  const totalCitations = cumCitations;
  const last6 = data.slice(-6).filter(d => d.submitted === 1).length;

  return (
    <ChartCard title="External Reach — Citations & Submissions" subtitle="Bars = weekly activity · line = cumulative citations" color={COLOR}
      insight={`${totalCitations}/2 citations confirmed YTD. ${totalSubmissions} external submissions total. Last 6 weeks: ${last6} submission${last6 !== 1 ? 's' : ''} (higher activity increases citation probability).`}>
      <ResponsiveContainer width="100%" height={190}>
        <ComposedChart data={chartData} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} />
          <YAxis yAxisId="left" tick={{ fill: '#475569', fontSize: 10 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 10 }} allowDecimals={false} />
          <Tooltip content={<DarkTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <Bar yAxisId="left" dataKey="citations" fill={COLOR + '80'} name="Citations (week)" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="submitted" fill="#818CF880" name="Submitted externally" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="cumCitations" stroke={COLOR} strokeWidth={2.5} dot={{ r: 4 }} name="Cumulative citations" />
          <ReferenceLine yAxisId="right" y={2} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target 2', fill: '#10B981', fontSize: 10 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

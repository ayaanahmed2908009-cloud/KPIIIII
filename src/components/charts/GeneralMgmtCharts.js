import React from 'react';
import {
  LineChart, Line, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ComposedChart, Area, AreaChart
} from 'recharts';
import { ChartCard, DarkTooltip, AIInsightBox, StatPill, CHART_DEFAULTS, EmptyChartState } from './ChartShared';
import { hasEnoughData, extractTeamData } from '../../data/placeholderData';

const COLOR = '#8B5CF6';

function buildData(history) {
  if (!hasEnoughData(history, 'generalManagement')) return { data: [], isEmpty: true };
  const raw = extractTeamData(history, 'generalManagement');
  const data = raw.map(e => ({
    week: e.weekNumber,
    joined: e.inputs.newMembersJoined || 0,
    left: e.inputs.membersWhoLeft || 0,
    total: e.inputs.totalActiveMembers || 0,
    okrCompleted: e.inputs.okrTasksCompleted || 0,
    okrDue: e.inputs.okrTasksDue || 0,
    selfAssessed: e.inputs.probabilityAchievementScore || 0,
    satisfaction: e.inputs.workerSatisfactionSurvey || 0,
    respondents: e.inputs.surveyRespondents || 0,
  }));
  return { data, isEmpty: false };
}

// 1 — Headcount Line Chart
export function HeadcountChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Team Headcount" subtitle="Weekly total · joins and departures overlaid" color={COLOR}><EmptyChartState /></ChartCard>;

  const latest = data[data.length - 1];
  const netChange = data.length > 1 ? latest.total - data[0].total : 0;
  const weeklyRate = data.length > 1 ? (netChange / (data.length - 1)).toFixed(1) : 0;
  const weeksToTarget = weeklyRate > 0 ? Math.ceil((22 - (latest?.total || 14)) / weeklyRate) : '—';

  return (
    <ChartCard title="Team Headcount" subtitle="Weekly total · joins and departures overlaid" color={COLOR}
      insight={`${latest?.total || 14} active members (target: 22). Net change: +${netChange} in ${data.length} weeks. ~${weeksToTarget} weeks to target.`}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <StatPill label="Current" value={latest?.total || 0} color={COLOR} />
        <StatPill label="Target" value="22" color="#475569" />
        <StatPill label="Joins" value={`+${data.reduce((s, d) => s + d.joined, 0)}`} color="#34d399" />
        <StatPill label="Left" value={`-${data.reduce((s, d) => s + d.left, 0)}`} color="#f87171" />
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 26]} />
          <Tooltip content={<DarkTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <ReferenceLine y={22} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target 22', fill: '#10B981', fontSize: 10 }} />
          <Area type="monotone" dataKey="total" stroke={COLOR} fill={COLOR + '20'} strokeWidth={2.5} name="Active members" dot={false} />
          <Bar dataKey="joined" fill="#10B98160" name="Joined" radius={[2, 2, 0, 0]} />
          <Bar dataKey="left" fill="#EF444460" name="Left" radius={[2, 2, 0, 0]} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 2 — OKR Completion Heatmap
export function OKRHeatmapChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="OKR Completion Heatmap" subtitle="Each cell = one week · green >70% · amber 50–70% · red <50%" color={COLOR}><EmptyChartState /></ChartCard>;

  const avgRate = data.length > 0
    ? parseFloat((data.reduce((s, d) => s + (d.okrDue > 0 ? d.okrCompleted / d.okrDue * 100 : 0), 0) / data.length).toFixed(1))
    : 0;

  return (
    <ChartCard title="OKR Completion Heatmap" subtitle="Each cell = one week · green >70% · amber 50–70% · red <50%" color={COLOR}
      insight={`Average weekly OKR completion: ${avgRate}% (target: 70%). ${avgRate >= 70 ? '✓ Consistently meeting target.' : `${data.filter(d => d.okrDue > 0 && d.okrCompleted / d.okrDue >= 0.7).length}/${data.length} weeks on target.`}`}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {data.map((d, i) => {
          const rate = d.okrDue > 0 ? (d.okrCompleted / d.okrDue) * 100 : 0;
          const bg = rate >= 70 ? '#064e3b' : rate >= 50 ? '#451a03' : '#450a0a';
          const fg = rate >= 70 ? '#34d399' : rate >= 50 ? '#fbbf24' : '#f87171';
          return (
            <div key={i} title={`Week ${d.week}: ${d.okrCompleted}/${d.okrDue} tasks (${rate.toFixed(0)}%)`} style={{
              background: bg, border: `1px solid ${fg}40`,
              borderRadius: '6px', width: '56px', height: '56px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: fg }}>{rate.toFixed(0)}%</div>
              <div style={{ fontSize: '9px', color: fg + '90' }}>Wk {d.week}</div>
              <div style={{ fontSize: '9px', color: '#475569' }}>{d.okrCompleted}/{d.okrDue}</div>
            </div>
          );
        })}
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data.map(d => ({ week: d.week, rate: d.okrDue > 0 ? parseFloat((d.okrCompleted / d.okrDue * 100).toFixed(1)) : 0 }))} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
          <YAxis tick={{ fill: '#475569', fontSize: 9 }} domain={[0, 100]} tickFormatter={v => v + '%'} />
          <Tooltip content={<DarkTooltip formatter={(v) => v + '%'} />} />
          <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="3 2" strokeWidth={1} />
          <Bar dataKey="rate" radius={[3, 3, 0, 0]} name="Completion" fill={COLOR + '80'} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 3 — Retention Rate Donut
export function RetentionDonutChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Member Retention Rate" subtitle="Rolling retention vs. 80% annual target" color={COLOR}><EmptyChartState /></ChartCard>;

  const totalLeft = data.reduce((s, d) => s + d.left, 0);
  const totalJoined = data.reduce((s, d) => s + d.joined, 0);
  const baseline = 14;
  const totalExposed = baseline + totalJoined;
  const retentionRate = totalExposed > 0 ? parseFloat(((1 - totalLeft / totalExposed) * 100).toFixed(1)) : 100;
  const onTarget = retentionRate >= 80;
  const donutData = [
    { name: 'Retained', value: retentionRate, fill: onTarget ? '#10B981' : '#F59E0B' },
    { name: 'Churned', value: 100 - retentionRate, fill: '#1e293b' },
  ];

  return (
    <ChartCard title="Member Retention Rate" subtitle="Rolling retention vs. 80% annual target" color={COLOR}
      insight={`${retentionRate}% retention rate (target: 80%). ${totalLeft} member${totalLeft !== 1 ? 's' : ''} lost since tracking began. ${onTarget ? '✓ On target.' : `⚠ ${(80 - retentionRate).toFixed(1)} points below target.`}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
          <ResponsiveContainer width={140} height={140}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={donutData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={6} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: onTarget ? '#10B981' : '#fbbf24' }}>{retentionRate}%</div>
            <div style={{ fontSize: '10px', color: '#475569' }}>retention</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <StatPill label="Retention" value={`${retentionRate}%`} color={onTarget ? '#34d399' : '#fbbf24'} />
          <StatPill label="Members lost" value={totalLeft} color="#f87171" />
          <StatPill label="Target" value="≥80%" color="#475569" />
        </div>
      </div>
    </ChartCard>
  );
}

// 4 — Worker Satisfaction Survey
export function SatisfactionChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Worker Satisfaction Survey" subtitle="Quarterly results · ≥90% target" color={COLOR}><EmptyChartState message="Enter quarterly survey results in your weekly inputs to unlock this chart" /></ChartCard>;

  const surveyData = data.filter(d => d.satisfaction > 0).map(d => ({
    week: d.week, satisfaction: d.satisfaction, respondents: d.respondents, lowSample: d.respondents < 10
  }));
  const latest = surveyData[surveyData.length - 1];

  return (
    <ChartCard title="Worker Satisfaction Survey" subtitle="Quarterly results · ≥90% target · ⚠ = low response count" color={COLOR}
      insight={surveyData.length > 0
        ? `Latest: ${latest.satisfaction}% (n=${latest.respondents}). ${latest.lowSample ? '⚠ Low response count.' : ''} ${latest.satisfaction >= 90 ? '✓ On target.' : `${90 - latest.satisfaction} points below 90% target.`}`
        : 'No survey data yet. Enter quarterly results in the weekly input form.'}>
      {surveyData.length === 0 ? (
        <EmptyChartState message="Enter worker satisfaction scores in quarterly survey weeks" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={surveyData} margin={CHART_DEFAULTS.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[70, 100]} tickFormatter={v => v + '%'} />
              <Tooltip content={<DarkTooltip formatter={(v, n) => n === 'satisfaction' ? v + '%' : v} />} />
              <ReferenceLine y={90} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target 90%', fill: '#10B981', fontSize: 10 }} />
              <Bar dataKey="satisfaction" radius={[4, 4, 0, 0]} name="Satisfied %" fill={COLOR} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            {surveyData.map((d, i) => (
              <div key={i} style={{ fontSize: '11px', color: d.lowSample ? '#fbbf24' : '#475569' }}>
                Wk{d.week}: {d.respondents} resp.{d.lowSample ? ' ⚠' : ''}
              </div>
            ))}
          </div>
        </>
      )}
    </ChartCard>
  );
}

// 5 — Self-Assessment vs AI Probability
export function SelfVsAIChart({ history, analysisHistory }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Self-Assessment vs AI Probability" subtitle="Weekly self-assessed score vs Claude's calculated probability" color={COLOR} isAI><EmptyChartState /></ChartCard>;

  const aiProbs = (analysisHistory || []).map(a => ({
    week: a.weekNumber,
    aiProb: a.analysis?.generalManagement?.overallProbability || null
  }));
  const chartData = data.map(d => {
    const aiEntry = aiProbs.find(a => a.week === d.week);
    return {
      week: d.week,
      selfAssessed: d.selfAssessed,
      aiProbability: aiEntry?.aiProb || null,
      divergence: aiEntry?.aiProb ? Math.abs(d.selfAssessed - aiEntry.aiProb) : null
    };
  });
  const avgDivergence = chartData.filter(d => d.divergence !== null).length > 0
    ? parseFloat((chartData.filter(d => d.divergence !== null).reduce((s, d) => s + d.divergence, 0) / chartData.filter(d => d.divergence !== null).length).toFixed(1))
    : null;
  const latestSelf = data[data.length - 1]?.selfAssessed || 0;

  return (
    <ChartCard title="Self-Assessment vs AI Probability" subtitle="Weekly self-assessed score vs Claude's calculated probability" color={COLOR} isAI
      insight={avgDivergence !== null ? `Average divergence: ${avgDivergence} points. ${avgDivergence > 15 ? '⚠ High divergence — perception and AI assessment differ significantly.' : '✓ Estimates well-aligned.'}` : `Self-assessed this week: ${latestSelf}%. Run AI analysis to compare.`}>
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={chartData} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[40, 100]} tickFormatter={v => v + '%'} />
          <Tooltip content={<DarkTooltip formatter={(v) => v ? v + '%' : '—'} />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <ReferenceLine y={70} stroke="#334155" strokeDasharray="3 2" strokeWidth={1} />
          <Line type="monotone" dataKey="selfAssessed" stroke={COLOR} strokeWidth={2.5} dot={{ r: 4, fill: COLOR }} name="Self-assessed" />
          <Line type="monotone" dataKey="aiProbability" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 4, fill: '#F59E0B' }} name="AI probability" connectNulls />
        </LineChart>
      </ResponsiveContainer>
      {avgDivergence === null && (
        <div style={{ fontSize: '12px', color: '#475569', textAlign: 'center', marginTop: '8px' }}>Run AI Analysis to see the comparison line</div>
      )}
    </ChartCard>
  );
}

import React from 'react';
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area
} from 'recharts';
import { ChartCard, DarkTooltip, AIInsightBox, StatPill, CHART_DEFAULTS, EmptyChartState } from './ChartShared';
import { pacePoint, hasEnoughData, extractTeamData } from '../../data/placeholderData';

const COLOR = '#10B981';

function buildData(history) {
  if (!hasEnoughData(history, 'sponsorships')) return { data: [], isEmpty: true };
  const raw = extractTeamData(history, 'sponsorships');
  const data = raw.map(e => ({
    week: e.weekNumber,
    meetings: e.inputs.outreachMeetingsHeld || 0,
    prospectsOutreach: e.inputs.prospectsOutreachStage || 0,
    prospectsMeeting: e.inputs.prospectsMeetingStage || 0,
    newPartnerships: e.inputs.newPartnershipsFormalised || 0,
    totalPartners: e.inputs.totalActivePartners || 0,
    fundsWeek: e.inputs.fundsRaisedThisWeek || 0,
    fundsYTD: e.inputs.totalFundsRaisedYTD || 0,
  }));
  return { data, isEmpty: false };
}

// 1 — Fundraising Thermometer
export function FundraisingThermometer({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Fundraising Thermometer" subtitle="YTD total vs. $10,000 annual target" color={COLOR}><EmptyChartState /></ChartCard>;

  const latest = data[data.length - 1];
  const ytd = latest?.fundsYTD || 0;
  const pct = Math.min((ytd / 10000) * 100, 100);
  const fillColor = pct >= 70 ? '#10B981' : pct >= 33 ? '#F59E0B' : '#EF4444';
  const weeklyAvg = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.fundsWeek, 0) / data.length) : 0;
  const weeksToTarget = weeklyAvg > 0 ? Math.ceil((10000 - ytd) / weeklyAvg) : '—';

  return (
    <ChartCard title="Fundraising Thermometer" subtitle="YTD total vs. $10,000 annual target" color={COLOR}
      insight={`$${ytd.toLocaleString()} raised (${pct.toFixed(1)}% of target). Avg $${weeklyAvg.toLocaleString()}/week. At this pace, target reached in ~${weeksToTarget} weeks.`}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontSize: '11px', color: '#475569' }}>$10,000</div>
          <div style={{ position: 'relative', width: '36px', height: '160px', background: '#0f172a', borderRadius: '18px 18px 0 0', border: '2px solid #334155', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${pct}%`,
              background: `linear-gradient(to top, ${fillColor}, ${fillColor}99)`,
              transition: 'height 0.8s ease',
            }} />
            {[75, 50, 25].map(tick => (
              <div key={tick} style={{ position: 'absolute', bottom: `${tick}%`, left: 0, right: 0, borderTop: '1px dashed #1e293b' }} />
            ))}
          </div>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: fillColor + '30', border: `3px solid ${fillColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '18px' }}>💰</span>
          </div>
          <div style={{ fontSize: '11px', color: '#475569' }}>$0</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: fillColor + '15', border: `1px solid ${fillColor}30`, borderRadius: '8px', padding: '12px 16px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Raised YTD</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: fillColor }}>${ytd.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: '#475569' }}>of $10,000 target</div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ fontSize: '11px', color: '#475569', marginBottom: '3px' }}>Progress</div>
            <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: fillColor, borderRadius: '4px', transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: fillColor, marginTop: '4px' }}>{pct.toFixed(1)}%</div>
          </div>
          <StatPill label="Avg weekly raise" value={`$${weeklyAvg.toLocaleString()}`} color={COLOR} />
        </div>
      </div>
    </ChartCard>
  );
}

// 2 — Partner Pipeline Kanban
export function PartnerPipelineKanban({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Partner Pipeline Kanban" subtitle="Live stage snapshot · outreach → meeting → formalised" color={COLOR}><EmptyChartState /></ChartCard>;

  const latest = data[data.length - 1];
  const cols = [
    { label: 'Outreach', value: latest?.prospectsOutreach || 0, color: '#3B82F6', icon: '📤' },
    { label: 'In Meeting', value: latest?.prospectsMeeting || 0, color: '#F59E0B', icon: '🤝' },
    { label: 'Formalised', value: latest?.totalPartners || 0, color: '#10B981', icon: '✅' },
  ];
  const totalMeetings = data.reduce((s, d) => s + d.meetings, 0);
  const totalPartnerships = latest?.totalPartners || 0;
  const convRate = totalMeetings > 0 ? ((totalPartnerships / totalMeetings) * 100).toFixed(1) : 0;

  return (
    <ChartCard title="Partner Pipeline Kanban" subtitle="Live stage snapshot · outreach → meeting → formalised" color={COLOR}
      insight={`${totalMeetings} total meetings held. Conversion rate to partnership: ${convRate}% (target: 20%). ${totalPartnerships >= 1 ? '✓ Year 1 partner target met.' : '0 active partners — pipeline needs to close.'}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '4px' }}>
        {cols.map((col, i) => (
          <div key={i} style={{
            background: '#0f172a', border: `1px solid ${col.color}30`,
            borderTop: `3px solid ${col.color}`, borderRadius: '8px',
            padding: '14px 12px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{col.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: col.color }}>{col.value}</div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>{col.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', marginTop: '10px' }}>
              {Array.from({ length: Math.min(col.value, 8) }).map((_, j) => (
                <div key={j} style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color + '70' }} />
              ))}
              {col.value > 8 && <span style={{ fontSize: '9px', color: '#475569' }}>+{col.value - 8}</span>}
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

// 3 — Weekly Funds Bar + Cumulative Line
export function WeeklyFundsChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Weekly Funds Raised + Cumulative YTD" subtitle="Bars = weekly · line = cumulative · dashed = required pace" color={COLOR}><EmptyChartState /></ChartCard>;

  const chartData = data.map(d => ({ ...d, pace: d.week >= 1 ? pacePoint(d.week, 10000) : null }));

  return (
    <ChartCard title="Weekly Funds Raised + Cumulative YTD" subtitle="Bars = weekly · line = cumulative · dashed = required pace" color={COLOR}
      insight={`Latest YTD: $${(data[data.length - 1]?.fundsYTD || 0).toLocaleString()}. Required YTD pace at week ${data[data.length - 1]?.week || '—'}: $${Math.round(pacePoint(data[data.length - 1]?.week || 0, 10000)).toLocaleString()}.`}>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
          <YAxis yAxisId="left" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
          <Tooltip content={<DarkTooltip formatter={(v) => `$${v.toLocaleString()}`} />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <Bar yAxisId="left" dataKey="fundsWeek" fill={COLOR + '80'} name="Raised this week" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="fundsYTD" stroke={COLOR} strokeWidth={2.5} dot={{ r: 3 }} name="Cumulative YTD" />
          <Line yAxisId="right" type="monotone" dataKey="pace" stroke="#334155" strokeDasharray="5 3" strokeWidth={1.5} dot={false} name="Required pace" />
          <ReferenceLine yAxisId="right" y={10000} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Target', fill: '#F59E0B', fontSize: 10 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 4 — Conversion Rate Trend
export function ConversionRateChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Outreach → Partnership Conversion Rate" subtitle="Cumulative rolling rate vs. 20% target" color={COLOR}><EmptyChartState /></ChartCard>;

  let cumulativeMeetings = 0, cumulativePartnerships = 0;
  const chartData = data.map(d => {
    cumulativeMeetings += d.meetings;
    cumulativePartnerships += d.newPartnerships;
    const rate = cumulativeMeetings > 0 ? parseFloat(((cumulativePartnerships / cumulativeMeetings) * 100).toFixed(1)) : 0;
    return { ...d, conversionRate: rate };
  });
  const latest = chartData[chartData.length - 1];

  return (
    <ChartCard title="Outreach → Partnership Conversion Rate" subtitle="Cumulative rolling rate vs. 20% target" color={COLOR}
      insight={`Current conversion rate: ${latest?.conversionRate || 0}% (target: 20%). ${(latest?.conversionRate || 0) >= 20 ? '✓ On target.' : `Need to convert ${Math.max(0, Math.ceil(cumulativeMeetings * 0.2 - cumulativePartnerships))} more meetings into partnerships.`}`}>
      <ResponsiveContainer width="100%" height={190}>
        <ComposedChart data={chartData} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 40]} tickFormatter={v => v + '%'} />
          <Tooltip content={<DarkTooltip formatter={(v) => v + '%'} />} />
          <defs>
            <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLOR} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="conversionRate" stroke={COLOR} fill="url(#convGrad)" strokeWidth={2} name="Conv. Rate" dot={{ r: 3, fill: COLOR }} />
          <ReferenceLine y={20} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Target 20%', fill: '#F59E0B', fontSize: 10, position: 'right' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 5 — AI Deal Health Assessment
export function DealHealthCard({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="AI Deal Health Assessment" subtitle="Pipeline stage analysis + recommended action" color={COLOR} isAI><EmptyChartState /></ChartCard>;

  const latest = data[data.length - 1];
  const totalMeetings = data.reduce((s, d) => s + d.meetings, 0);
  const pipelineSize = (latest?.prospectsOutreach || 0) + (latest?.prospectsMeeting || 0);
  const health = pipelineSize >= 8 ? 'Strong' : pipelineSize >= 4 ? 'Active' : 'Thin';
  const healthColor = health === 'Strong' ? '#34d399' : health === 'Active' ? '#fbbf24' : '#f87171';
  const stages = [
    { label: 'Outreach quality', score: Math.min(totalMeetings * 8, 100), color: '#3B82F6' },
    { label: 'Pipeline depth', score: Math.min(pipelineSize * 10, 100), color: '#F59E0B' },
    { label: 'Close velocity', score: latest?.totalPartners ? 80 : 20, color: '#10B981' },
  ];

  return (
    <ChartCard title="AI Deal Health Assessment" subtitle="Pipeline stage analysis + recommended action" color={COLOR} isAI>
      <div style={{ background: healthColor + '15', border: `1px solid ${healthColor}40`, borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>Overall Pipeline Health</div>
        <div style={{ fontSize: '22px', fontWeight: '800', color: healthColor }}>{health}</div>
      </div>
      {stages.map((s, i) => (
        <div key={i} style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{s.label}</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: s.color }}>{s.score}%</span>
          </div>
          <div style={{ height: '6px', background: '#0f172a', borderRadius: '3px' }}>
            <div style={{ height: '100%', width: `${s.score}%`, background: s.color, borderRadius: '3px', transition: 'width 0.5s' }} />
          </div>
        </div>
      ))}
      <AIInsightBox
        verdict={health === 'Strong' ? 'On Track' : health === 'Active' ? 'Needs Attention' : 'Action Required'}
        verdictColor={healthColor}
        text={
          health === 'Strong'
            ? `Pipeline has ${pipelineSize} active prospects across stages. Focus on moving meeting-stage prospects to close.`
            : health === 'Active'
            ? `${pipelineSize} prospects in pipeline. Prioritise advancing meeting-stage conversations to formal agreements.`
            : `Pipeline is thin with only ${pipelineSize} prospects. Increase outreach — target 3 new prospect calls per week.`
        }
      />
    </ChartCard>
  );
}

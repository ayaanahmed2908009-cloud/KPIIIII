import React from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ChartCard, DarkTooltip, StatPill, CHART_DEFAULTS, EmptyChartState } from './ChartShared';
import { extractTeamData, hasEnoughData, pacePoint } from '../../data/placeholderData';

const COLOR = '#14B8A6';

function buildBDData(history) {
  if (!hasEnoughData(history, 'businessDevelopment')) return { data: [], isEmpty: true };
  const raw = extractTeamData(history, 'businessDevelopment');
  let cumRevenue = 0;
  let cumNewCustomers = 0;
  const data = raw.map(e => {
    cumRevenue = e.inputs.totalRevenueYTD || cumRevenue + (e.inputs.revenueThisWeek || 0);
    cumNewCustomers += e.inputs.newCustomersThisWeek || 0;
    const cac = (e.inputs.marketingSpendThisWeek > 0 && e.inputs.newCustomersThisWeek > 0)
      ? +(e.inputs.marketingSpendThisWeek / e.inputs.newCustomersThisWeek).toFixed(2)
      : null;
    return {
      week: e.weekNumber,
      revenueThisWeek: e.inputs.revenueThisWeek || 0,
      totalRevenueYTD: cumRevenue,
      orders: e.inputs.ordersThisWeek || 0,
      newCustomers: e.inputs.newCustomersThisWeek || 0,
      repeatCustomers: e.inputs.repeatCustomersTotal || 0,
      activeChannels: e.inputs.activeChannels || 0,
      marketingSpend: e.inputs.marketingSpendThisWeek || 0,
      cac,
      satisfactionScore: e.inputs.satisfactionResponses > 0 ? e.inputs.satisfactionScore : null,
      partnershipsSignedTotal: e.inputs.partnershipsSignedTotal || 0,
      partnershipLeads: e.inputs.partnershipLeads || 0,
    };
  });
  return { data, isEmpty: false };
}

// 1 — Revenue Trajectory
export function RevenueTrajectoryChart({ history }) {
  const { data, isEmpty } = buildBDData(history);
  if (isEmpty) return (
    <ChartCard title="Revenue Trajectory" subtitle="Weekly revenue vs. $7,000 annual pace" color={COLOR}>
      <EmptyChartState message="Submit weekly revenue data to track progress toward $7,000" />
    </ChartCard>
  );

  const latest = data[data.length - 1];
  const gap = 7000 - latest.totalRevenueYTD;
  const avgWeekly = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.revenueThisWeek, 0) / data.length)
    : 0;
  const weeksToTarget = avgWeekly > 0 ? Math.ceil(gap / avgWeekly) : '—';
  const chartData = data.map(d => ({ ...d, pace: d.week >= 1 ? pacePoint(d.week, 7000) : null }));
  const insight = `$${latest.totalRevenueYTD.toLocaleString()} YTD — $${gap.toLocaleString()} from target. At $${avgWeekly}/week avg, ~${weeksToTarget} weeks to go.`;

  return (
    <ChartCard title="Revenue Trajectory" subtitle="Cumulative YTD vs. $7,000 pace line" color={COLOR} insight={insight}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <StatPill label="Revenue YTD" value={`$${latest.totalRevenueYTD.toLocaleString()}`} color={COLOR} />
        <StatPill label="This Week" value={`$${latest.revenueThisWeek.toLocaleString()}`} color="#64748b" />
        <StatPill label="Gap to $7k" value={`$${gap.toLocaleString()}`} color={gap > 0 ? '#F59E0B' : '#10B981'} />
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={chartData} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `Wk ${v}`} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `$${v}`} />
          <Tooltip content={<DarkTooltip formatter={(v, n) => n.includes('pace') ? `$${v}` : `$${v}`} />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <ReferenceLine y={7000} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target $7k', fill: '#10B981', fontSize: 10 }} />
          <Line type="monotone" dataKey="totalRevenueYTD" name="Revenue YTD" stroke={COLOR} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="pace" name="Pace to $7k" stroke="#334155" strokeWidth={1} strokeDasharray="4 4" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 2 — Customer Acquisition
export function CustomerAcquisitionChart({ history }) {
  const { data, isEmpty } = buildBDData(history);
  if (isEmpty) return (
    <ChartCard title="Customer Acquisition" subtitle="New vs. repeat customers each week" color={COLOR}>
      <EmptyChartState message="Submit customer data to track acquisition and retention" />
    </ChartCard>
  );

  const latest = data[data.length - 1];
  const totalNew = data.reduce((s, d) => s + d.newCustomers, 0);
  const insight = `${latest.repeatCustomers} repeat customers total (target: 10). ${totalNew} new customers acquired YTD.`;

  return (
    <ChartCard title="Customer Acquisition" subtitle="New customers per week · repeat customer total" color={COLOR} insight={insight}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <StatPill label="Repeat Customers" value={latest.repeatCustomers} color={latest.repeatCustomers >= 10 ? '#10B981' : COLOR} />
        <StatPill label="Target" value="10" color="#475569" />
        <StatPill label="New This Week" value={latest.newCustomers} color="#64748b" />
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={data} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `Wk ${v}`} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
          <Tooltip content={<DarkTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <Bar dataKey="newCustomers" name="New customers" fill={COLOR} opacity={0.8} />
          <Line type="monotone" dataKey="repeatCustomers" name="Repeat total" stroke="#F59E0B" strokeWidth={2} dot={false} />
          <ReferenceLine y={10} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target 10', fill: '#10B981', fontSize: 10 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 3 — Customer Acquisition Cost
export function CACChart({ history }) {
  const { data, isEmpty } = buildBDData(history);
  const cacData = isEmpty ? [] : data.filter(d => d.cac !== null);

  if (isEmpty || cacData.length === 0) return (
    <ChartCard title="Customer Acquisition Cost (CAC)" subtitle="Marketing spend ÷ new customers acquired" color={COLOR}>
      <EmptyChartState message="Submit both marketing spend and new customer count to calculate CAC" />
    </ChartCard>
  );

  const avgCac = +(cacData.reduce((s, d) => s + d.cac, 0) / cacData.length).toFixed(2);
  const insight = `Average CAC: $${avgCac} across ${cacData.length} tracked weeks. CAC being tracked = Year 1 target achieved.`;

  return (
    <ChartCard title="Customer Acquisition Cost" subtitle="$/customer — Year 1 goal is to track this consistently" color={COLOR} insight={insight}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <StatPill label="Avg CAC" value={`$${avgCac}`} color={COLOR} />
        <StatPill label="Weeks tracked" value={cacData.length} color="#64748b" />
        <StatPill label="Latest spend" value={`$${data[data.length - 1].marketingSpend}`} color="#475569" />
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={cacData} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `Wk ${v}`} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `$${v}`} />
          <Tooltip content={<DarkTooltip formatter={v => `$${v}`} />} />
          <Line type="monotone" dataKey="cac" name="CAC ($)" stroke={COLOR} strokeWidth={2} dot={{ fill: COLOR, r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 4 — Satisfaction & Channels
export function SatisfactionChannelsChart({ history }) {
  const { data, isEmpty } = buildBDData(history);
  if (isEmpty) return (
    <ChartCard title="Satisfaction & Sales Channels" subtitle="Customer rating and channel count over time" color={COLOR}>
      <EmptyChartState message="Submit satisfaction scores and channel count to track quality" />
    </ChartCard>
  );

  const latest = data[data.length - 1];
  const feedbackWeeks = data.filter(d => d.satisfactionScore !== null);
  const avgScore = feedbackWeeks.length
    ? +(feedbackWeeks.reduce((s, d) => s + d.satisfactionScore, 0) / feedbackWeeks.length).toFixed(1)
    : null;

  const insight = avgScore
    ? `Avg satisfaction ${avgScore}/5 across ${feedbackWeeks.length} feedback weeks. ${latest.activeChannels} active channel${latest.activeChannels !== 1 ? 's' : ''} (target: 2).`
    : `${latest.activeChannels} active channel${latest.activeChannels !== 1 ? 's' : ''} (target: 2). No satisfaction data yet — start collecting customer feedback.`;

  return (
    <ChartCard title="Satisfaction & Sales Channels" subtitle="Customer rating per feedback week · channel count" color={COLOR} insight={insight}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <StatPill label="Avg Satisfaction" value={avgScore !== null ? `${avgScore}/5` : '—'} color={avgScore >= 3.5 ? '#10B981' : '#F59E0B'} />
        <StatPill label="Active Channels" value={latest.activeChannels} color={latest.activeChannels >= 2 ? '#10B981' : COLOR} />
        <StatPill label="Partnerships" value={latest.partnershipsSignedTotal} color="#64748b" />
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <ComposedChart data={data} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `Wk ${v}`} />
          <YAxis yAxisId="left" domain={[0, 5]} tick={{ fill: '#475569', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 10 }} />
          <Tooltip content={<DarkTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <ReferenceLine yAxisId="left" y={3.5} stroke="#10B981" strokeDasharray="4 4" />
          <Line yAxisId="left" type="monotone" dataKey="satisfactionScore" name="Satisfaction (0–5)" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
          <Bar yAxisId="right" dataKey="activeChannels" name="Active channels" fill={COLOR} opacity={0.4} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

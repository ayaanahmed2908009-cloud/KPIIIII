import React from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ComposedChart
} from 'recharts';
import { ChartCard, DarkTooltip, SemiGauge, AIInsightBox, StatPill, CHART_DEFAULTS, EmptyChartState } from './ChartShared';
import { pacePoint, hasEnoughData, extractTeamData } from '../../data/placeholderData';

const COLOR = '#3B82F6';

function buildMarketingData(history) {
  if (!hasEnoughData(history, 'marketing')) return { data: [], isEmpty: true };
  const raw = extractTeamData(history, 'marketing');
  let cumMentions = 0;
  const data = raw.map(e => {
    cumMentions += e.inputs.pressMentionsConfirmed || 0;
    return {
      week: e.weekNumber,
      followers: e.inputs.totalFollowers || 0,
      engagementRate: e.inputs.avgEngagementRate || 0,
      posts: e.inputs.postsPublished || 0,
      videos: e.inputs.videosPublished || 0,
      pressContacts: e.inputs.pressContactsReached || 0,
      pressMentions: e.inputs.pressMentionsConfirmed || 0,
      cumulativeMentions: cumMentions,
    };
  });
  return { data, isEmpty: false };
}

// 1 — Follower Growth Trajectory
export function FollowerGrowthChart({ history }) {
  const { data, isEmpty } = buildMarketingData(history);
  if (isEmpty) return <ChartCard title="Follower Growth Trajectory" subtitle="Weekly cumulative vs. pace-to-3,000 line" color={COLOR}><EmptyChartState /></ChartCard>;

  const latest = data[data.length - 1];
  const weeklyGain = data.length > 1 ? Math.round((latest.followers - data[0].followers) / (data.length - 1)) : 0;
  const weeksToTarget = weeklyGain > 0 ? Math.ceil((3000 - latest.followers) / weeklyGain) : '—';
  const chartData = data.map(d => ({ ...d, pace: pacePoint(d.week, 3000) }));
  const insight = `Currently ${latest.followers.toLocaleString()} followers — ${(3000 - latest.followers).toLocaleString()} away from target. At +${weeklyGain}/week, target reached in ~${weeksToTarget} weeks.`;

  return (
    <ChartCard title="Follower Growth Trajectory" subtitle="Weekly cumulative vs. pace-to-3,000 line" color={COLOR} insight={insight}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <StatPill label="Current" value={latest.followers.toLocaleString()} color={COLOR} />
        <StatPill label="Target" value="3,000" color="#475569" />
        <StatPill label="Gap" value={(3000 - latest.followers).toLocaleString()} color="#fbbf24" />
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={chartData} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} label={{ value: 'Week', position: 'insideBottomRight', fill: '#334155', fontSize: 10 }} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 3200]} />
          <Tooltip content={<DarkTooltip formatter={(v, n) => n === 'followers' ? v.toLocaleString() : v} />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <ReferenceLine y={3000} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target 3k', fill: '#10B981', fontSize: 10 }} />
          <Area type="monotone" dataKey="followers" fill={COLOR + '20'} stroke={COLOR} strokeWidth={2.5} name="Followers" dot={{ r: 3, fill: COLOR }} />
          <Line type="monotone" dataKey="pace" stroke="#334155" strokeDasharray="5 3" strokeWidth={1.5} dot={false} name="Target pace" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 2 — Engagement Rate Gauge + Sparkline
export function EngagementGaugeChart({ history }) {
  const { data, isEmpty } = buildMarketingData(history);
  if (isEmpty) return <ChartCard title="Engagement Rate" subtitle="Current week gauge + 4-week rolling average" color={COLOR}><EmptyChartState /></ChartCard>;

  const latest = data[data.length - 1];
  const rolling = data.length >= 4
    ? parseFloat((data.slice(-4).reduce((s, d) => s + d.engagementRate, 0) / 4).toFixed(2))
    : latest?.engagementRate || 0;
  const inTarget = rolling >= 2 && rolling <= 4;

  return (
    <ChartCard title="Engagement Rate" subtitle="Current week gauge + 4-week rolling average" color={COLOR}
      insight={`4-week rolling average: ${rolling}% — ${inTarget ? '✓ within 2–4% target band' : rolling < 2 ? '⚠ below 2% minimum' : '⚠ above 4% — investigate content type'}`}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <SemiGauge
          value={latest?.engagementRate || 0} min={0} max={8} target={3}
          unit="%" size={150}
          zones={[
            { from: 0, to: 2, color: '#EF4444' },
            { from: 2, to: 4, color: '#10B981' },
            { from: 4, to: 8, color: '#F59E0B' }
          ]}
          label="this week"
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>8-week sparkline</div>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={data} margin={{ top: 2, right: 4, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <YAxis domain={[0, 6]} tick={{ fill: '#475569', fontSize: 9 }} />
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 9 }} />
              <Tooltip content={<DarkTooltip formatter={(v) => v + '%'} />} />
              <ReferenceLine y={2} stroke="#EF4444" strokeDasharray="3 2" strokeWidth={1} />
              <ReferenceLine y={4} stroke="#EF4444" strokeDasharray="3 2" strokeWidth={1} />
              <Area type="monotone" dataKey="engagementRate" stroke={COLOR} fill="url(#engGrad)" strokeWidth={2} name="Eng. Rate" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Red lines = target band edges (2–4%)</div>
        </div>
      </div>
    </ChartCard>
  );
}

// 3 — Content Mix Stacked Bar
export function ContentMixChart({ history }) {
  const { data, isEmpty } = buildMarketingData(history);
  if (isEmpty) return <ChartCard title="Content Mix — Posts vs. Videos" subtitle="Weekly stacked bar · target ratio 2:1" color={COLOR}><EmptyChartState /></ChartCard>;

  const totalPosts = data.reduce((s, d) => s + d.posts, 0);
  const totalVideos = data.reduce((s, d) => s + d.videos, 0);
  const ratio = totalVideos > 0 ? (totalPosts / totalVideos).toFixed(1) : '—';
  const onTarget = totalVideos > 0 && totalPosts / totalVideos >= 1.5 && totalPosts / totalVideos <= 2.5;

  return (
    <ChartCard title="Content Mix — Posts vs. Videos" subtitle="Weekly stacked bar · target ratio 2:1" color={COLOR}
      insight={`YTD ratio ${ratio}:1 (target 2:1). ${onTarget ? '✓ Within range.' : '⚠ Adjust content mix.'} Total posts: ${totalPosts} · Videos: ${totalVideos}`}>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
          <Tooltip content={<DarkTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <Bar dataKey="posts" stackId="a" fill={COLOR} name="Posts" radius={[0, 0, 0, 0]} />
          <Bar dataKey="videos" stackId="a" fill="#818CF8" name="Videos" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 4 — Press Pipeline Funnel
export function PressFunnelChart({ history }) {
  const { data, isEmpty } = buildMarketingData(history);
  if (isEmpty) return <ChartCard title="Press Pipeline Funnel" subtitle="Cumulative YTD outreach → confirmed mentions" color={COLOR}><EmptyChartState /></ChartCard>;

  const totalContacts = data.reduce((s, d) => s + d.pressContacts, 0);
  const totalMentions = data[data.length - 1]?.cumulativeMentions || 0;
  const convRate = totalContacts > 0 ? ((totalMentions / totalContacts) * 100).toFixed(1) : 0;
  const stages = [
    { label: 'Press Contacts Reached', value: totalContacts, color: '#3B82F6' },
    { label: 'Mentions Confirmed (YTD)', value: totalMentions, color: '#10B981' },
    { label: 'Annual Target', value: 4, color: '#F59E0B' },
  ];
  const maxVal = Math.max(...stages.map(s => s.value), 1);

  return (
    <ChartCard title="Press Pipeline Funnel" subtitle="Cumulative YTD outreach → confirmed mentions" color={COLOR}
      insight={`Contact → mention conversion: ${convRate}%. ${totalMentions}/4 annual target confirmed. ${totalMentions >= 4 ? '✓ Target hit!' : `Need ${4 - totalMentions} more.`}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
        {stages.map((s, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{s.label}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: s.color }}>{s.value}</span>
            </div>
            <div style={{ height: '28px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.max((s.value / maxVal) * 100, s.value > 0 ? 4 : 0)}%`,
                background: s.color + (i === 0 ? '' : '90'),
                borderRadius: '6px',
                transition: 'width 0.5s ease',
                display: 'flex', alignItems: 'center', paddingLeft: '8px'
              }}>
                {s.value > 0 && <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>{s.value}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <AIInsightBox
        verdict={totalContacts >= 10 ? 'Pipeline Healthy' : 'Pipeline Thin'}
        verdictColor={totalContacts >= 10 ? '#34d399' : '#fbbf24'}
        text={`At ${convRate}% conversion with ${totalContacts} contacts reached, ${totalContacts >= 10 ? 'the pipeline is on pace to hit 4 mentions.' : 'increase outreach volume — target 15+ contacts per quarter to secure 4 annual mentions.'}`}
      />
    </ChartCard>
  );
}

// 5 — AI Momentum Score Card
export function MomentumCard({ history }) {
  const { data, isEmpty } = buildMarketingData(history);
  if (isEmpty) return <ChartCard title="AI Momentum Assessment" subtitle="4-week rolling analysis of growth & engagement" color={COLOR} isAI><EmptyChartState /></ChartCard>;

  const last4 = data.slice(-4);
  const avgGrowth = last4.length > 1
    ? Math.round((last4[last4.length - 1].followers - last4[0].followers) / (last4.length - 1))
    : 0;
  const avgEng = last4.length > 0
    ? parseFloat((last4.reduce((s, d) => s + d.engagementRate, 0) / last4.length).toFixed(2))
    : 0;
  const trend = avgGrowth >= 40 ? 'Accelerating' : avgGrowth >= 20 ? 'Steady' : 'Decelerating';
  const trendColor = trend === 'Accelerating' ? '#34d399' : trend === 'Steady' ? '#fbbf24' : '#f87171';

  return (
    <ChartCard title="AI Momentum Assessment" subtitle="4-week rolling analysis of growth & engagement" color={COLOR} isAI>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        <StatPill label="Avg weekly growth" value={`+${avgGrowth}`} color={COLOR} />
        <StatPill label="Avg engagement" value={`${avgEng}%`} color={COLOR} />
      </div>
      <div style={{
        background: trendColor + '15', border: `1px solid ${trendColor}40`,
        borderRadius: '10px', padding: '14px 18px', textAlign: 'center', marginBottom: '12px'
      }}>
        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Momentum Verdict</div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: trendColor }}>{trend}</div>
      </div>
      <AIInsightBox
        verdict={trend}
        verdictColor={trendColor}
        text={
          trend === 'Accelerating'
            ? `Strong growth of +${avgGrowth} followers/week with ${avgEng}% engagement. Channel strategy is working — maintain current content cadence and press outreach.`
            : trend === 'Steady'
            ? `Growth is consistent at +${avgGrowth}/week but could be faster. Experiment with one new content format or increase posting frequency to 5/week.`
            : `Growth has slowed to +${avgGrowth}/week. Review the last 4 posts for performance patterns and consider boosting top-performing content.`
        }
      />
    </ChartCard>
  );
}

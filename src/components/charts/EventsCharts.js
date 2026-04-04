import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ComposedChart, Cell
} from 'recharts';
import { ChartCard, DarkTooltip, AIInsightBox, StatPill, CHART_DEFAULTS, EmptyChartState } from './ChartShared';
import { pacePoint, hasEnoughData, extractTeamData } from '../../data/placeholderData';

const COLOR = '#EC4899';

function buildData(history) {
  if (!hasEnoughData(history, 'events')) return { data: [], isEmpty: true };
  const raw = extractTeamData(history, 'events');
  const data = raw.map(e => ({
    week: e.weekNumber,
    eventsHeld: e.inputs.eventsHeldThisWeek || 0,
    eventsYTD: e.inputs.totalEventsYTD || 0,
    attendees: e.inputs.attendeesThisWeek || 0,
    attendeesYTD: e.inputs.totalAttendeesYTD || 0,
    satisfaction: e.inputs.attendeeSatisfactionScore || 0,
    repeatPct: e.inputs.repeatAttendeePercentage || 0,
    volunteers: e.inputs.volunteersEngaged || 0,
    schoolsReached: e.inputs.schoolsReachedYTD || 0,
  }));
  return { data, isEmpty: false };
}

// 1 — Event Calendar Heatmap
export function EventCalendarHeatmap({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Event Activity Heatmap" subtitle="Each cell = one week · colour intensity = events held" color={COLOR}><EmptyChartState /></ChartCard>;

  const totalEvents = data.reduce((s, d) => s + d.eventsHeld, 0);
  const activeWeeks = data.filter(d => d.eventsHeld > 0).length;
  const maxEvents = Math.max(...data.map(d => d.eventsHeld), 1);

  return (
    <ChartCard title="Event Activity Heatmap" subtitle="Each cell = one week · colour intensity = events held" color={COLOR}
      insight={`${totalEvents} events held across ${data.length} weeks (${activeWeeks} active weeks). Target: 15/year. ${totalEvents >= 15 ? '✓ Annual target met!' : `${15 - totalEvents} more needed.`}`}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
        {data.map((d, i) => {
          const intensity = d.eventsHeld / maxEvents;
          const opacity = d.eventsHeld === 0 ? 1 : 0.3 + intensity * 0.7;
          return (
            <div key={i} title={`Week ${d.week}: ${d.eventsHeld} event(s)`} style={{
              background: d.eventsHeld === 0 ? '#0f172a' : COLOR,
              opacity: d.eventsHeld === 0 ? 1 : opacity,
              border: `1px solid ${d.eventsHeld > 0 ? COLOR + '60' : '#1e293b'}`,
              borderRadius: '6px', width: '52px', height: '52px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'default'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: d.eventsHeld > 0 ? '#fff' : '#334155' }}>
                {d.eventsHeld}
              </div>
              <div style={{ fontSize: '9px', color: d.eventsHeld > 0 ? '#fce7f3' : '#334155' }}>Wk {d.week}</div>
            </div>
          );
        })}
      </div>
      <ResponsiveContainer width="100%" height={90}>
        <BarChart data={data} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
          <YAxis tick={{ fill: '#475569', fontSize: 9 }} allowDecimals={false} />
          <Tooltip content={<DarkTooltip />} />
          <Bar dataKey="eventsHeld" name="Events held" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.eventsHeld >= 2 ? COLOR : d.eventsHeld === 1 ? COLOR + 'bb' : '#1e293b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 2 — Attendee Tracker (cumulative + weekly)
export function AttendeeTrackerChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Attendee Tracker — Weekly & Cumulative" subtitle="Bars = weekly attendance · line = cumulative · dashed = pace to 500" color={COLOR}><EmptyChartState /></ChartCard>;

  let cumAttendees = 0;
  const chartData = data.map(d => {
    cumAttendees += d.attendees;
    return { ...d, cumAttendees, pace: d.week >= 1 ? pacePoint(d.week, 500) : null };
  });
  const latest = chartData[chartData.length - 1];
  const weeklyAvg = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.attendees, 0) / data.length) : 0;

  return (
    <ChartCard title="Attendee Tracker — Weekly & Cumulative" subtitle="Bars = weekly attendance · line = cumulative · dashed = pace to 500" color={COLOR}
      insight={`${latest?.cumAttendees || 0} total attendees YTD (target: 500). Avg ${weeklyAvg}/event-week. ${latest?.cumAttendees >= 500 ? '✓ Target met!' : `${500 - (latest?.cumAttendees || 0)} attendees still needed.`}`}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <StatPill label="Total YTD" value={(latest?.cumAttendees || 0).toLocaleString()} color={COLOR} />
        <StatPill label="Target" value="500" color="#475569" />
        <StatPill label="Avg/week" value={weeklyAvg} color="#fbbf24" />
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={chartData} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
          <YAxis yAxisId="left" tick={{ fill: '#475569', fontSize: 10 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 10 }} />
          <Tooltip content={<DarkTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <Bar yAxisId="left" dataKey="attendees" fill={COLOR + '70'} name="Weekly attendees" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="cumAttendees" stroke={COLOR} strokeWidth={2.5} dot={{ r: 3 }} name="Cumulative" />
          <Line yAxisId="right" type="monotone" dataKey="pace" stroke="#334155" strokeDasharray="5 3" strokeWidth={1.5} dot={false} name="Required pace" />
          <ReferenceLine yAxisId="right" y={500} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target 500', fill: '#10B981', fontSize: 10 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 3 — Satisfaction Dot Plot
export function SatisfactionDotPlot({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Attendee Satisfaction Score" subtitle="Score per event week · bubble size = attendee count · ≥85% target" color={COLOR}><EmptyChartState /></ChartCard>;

  const satisfactionData = data.filter(d => d.satisfaction > 0).map(d => ({
    week: d.week,
    satisfaction: d.satisfaction,
    attendees: d.attendees,
  }));
  const avg = satisfactionData.length > 0
    ? parseFloat((satisfactionData.reduce((s, d) => s + d.satisfaction, 0) / satisfactionData.length).toFixed(1))
    : 0;
  const onTarget = avg >= 85;

  return (
    <ChartCard title="Attendee Satisfaction Score" subtitle="Score per event week · bubble size = attendee count · ≥85% target" color={COLOR}
      insight={satisfactionData.length > 0
        ? `Average satisfaction: ${avg}% across ${satisfactionData.length} events. ${onTarget ? '✓ Above 85% target.' : `⚠ ${(85 - avg).toFixed(1)} points below target.`} ${satisfactionData.filter(d => d.satisfaction >= 85).length}/${satisfactionData.length} events met threshold.`
        : 'No satisfaction data yet. Enter scores after each event.'}>
      {satisfactionData.length === 0 ? (
        <EmptyChartState message="Enter satisfaction scores after each event" />
      ) : (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <StatPill label="Avg score" value={`${avg}%`} color={onTarget ? '#34d399' : '#f87171'} />
            <StatPill label="Above 85%" value={`${satisfactionData.filter(d => d.satisfaction >= 85).length}/${satisfactionData.length}`} color={COLOR} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={satisfactionData} margin={CHART_DEFAULTS.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[60, 100]} tickFormatter={v => v + '%'} />
              <Tooltip content={<DarkTooltip formatter={(v, n) => n === 'satisfaction' ? v + '%' : v} />} />
              <ReferenceLine y={85} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target 85%', fill: '#10B981', fontSize: 10 }} />
              <ReferenceLine y={avg} stroke={COLOR} strokeDasharray="3 2" strokeWidth={1}
                label={{ value: `Avg ${avg}%`, fill: COLOR, fontSize: 9, position: 'right' }} />
              <Area type="monotone" dataKey="satisfaction" stroke={COLOR} fill={COLOR + '20'} strokeWidth={2.5} name="Satisfaction" dot={{ r: 5, fill: COLOR }} />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      )}
    </ChartCard>
  );
}

// 4 — Repeat Attendee Gauge + Schools Reached
export function RepeatAttendeeGauge({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Repeat Attendance & Schools Reached" subtitle="Repeat attendee % + cumulative schools engaged YTD" color={COLOR}><EmptyChartState /></ChartCard>;

  const latestRepeat = data.filter(d => d.repeatPct > 0);
  const latest = latestRepeat[latestRepeat.length - 1];
  const repeatPct = latest?.repeatPct || 0;
  const schoolsReached = data[data.length - 1]?.schoolsReached || 0;
  const color = repeatPct >= 30 ? '#34d399' : repeatPct >= 15 ? '#fbbf24' : '#f87171';

  const trendData = data.filter(d => d.repeatPct > 0).map(d => ({
    week: d.week,
    repeatPct: d.repeatPct,
    schoolsReached: d.schoolsReached,
  }));

  return (
    <ChartCard title="Repeat Attendance & Schools Reached" subtitle="Repeat attendee % + cumulative schools engaged YTD" color={COLOR}
      insight={`${repeatPct}% repeat attendee rate (target: 30%). ${schoolsReached} schools reached YTD (target: 5). ${repeatPct >= 30 ? '✓ Loyalty target met.' : `Build loyalty — ${(30 - repeatPct).toFixed(0)}% more repeat attendees needed.`}`}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1, background: '#0f172a', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>Repeat Attendees</div>
          <div style={{ position: 'relative', height: '12px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{ height: '100%', width: `${Math.min(repeatPct, 100)}%`, background: color, borderRadius: '6px', transition: 'width 0.8s ease' }} />
            <div style={{ position: 'absolute', top: 0, left: '30%', width: '2px', height: '100%', background: '#334155' }} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color }}>{repeatPct}%</div>
          <div style={{ fontSize: '10px', color: '#475569' }}>target: 30%</div>
        </div>
        <div style={{ flex: 1, background: '#0f172a', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>Schools Reached</div>
          <div style={{ position: 'relative', height: '12px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{ height: '100%', width: `${Math.min((schoolsReached / 5) * 100, 100)}%`, background: schoolsReached >= 5 ? '#34d399' : '#fbbf24', borderRadius: '6px', transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: schoolsReached >= 5 ? '#34d399' : '#fbbf24' }}>{schoolsReached}</div>
          <div style={{ fontSize: '10px', color: '#475569' }}>target: 5</div>
        </div>
      </div>
      {trendData.length > 1 && (
        <ResponsiveContainer width="100%" height={90}>
          <LineChart data={trendData} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
            <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickFormatter={v => v + '%'} />
            <Tooltip content={<DarkTooltip formatter={v => v + '%'} />} />
            <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 2" strokeWidth={1} />
            <Line type="monotone" dataKey="repeatPct" stroke={COLOR} strokeWidth={2} dot={{ r: 3 }} name="Repeat %" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// 5 — Volunteer Engagement
export function SponsorVolunteerChart({ history }) {
  const { data, isEmpty } = buildData(history);
  if (isEmpty) return <ChartCard title="Volunteer Engagement" subtitle="Weekly volunteers engaged · cumulative total" color={COLOR}><EmptyChartState /></ChartCard>;

  const totalVolunteers = data.reduce((s, d) => s + d.volunteers, 0);
  const latestVolunteers = data[data.length - 1]?.volunteers || 0;
  const avgVolunteers = data.length > 0 ? (totalVolunteers / data.length).toFixed(1) : 0;

  const health = latestVolunteers >= 10 ? 'Strong' : latestVolunteers >= 5 ? 'Building' : 'Early Stage';
  const healthColor = health === 'Strong' ? '#34d399' : health === 'Building' ? '#fbbf24' : '#f87171';

  let cumVolunteers = 0;
  const chartData = data.map(d => {
    cumVolunteers += d.volunteers;
    return { ...d, cumVolunteers };
  });

  return (
    <ChartCard title="Volunteer Engagement" subtitle="Weekly volunteers engaged · cumulative total" color={COLOR}
      insight={`${latestVolunteers} volunteers this week · ${totalVolunteers} total volunteer-weeks YTD · avg ${avgVolunteers}/week.`}>
      <div style={{
        background: healthColor + '15', border: `1px solid ${healthColor}40`,
        borderRadius: '8px', padding: '10px 14px', textAlign: 'center', marginBottom: '12px'
      }}>
        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>Volunteer Health</div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: healthColor }}>{health}</div>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <ComposedChart data={chartData} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => v < 1 ? `T${v + 2}` : `Wk ${v}`} />
          <YAxis yAxisId="left" tick={{ fill: '#475569', fontSize: 10 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 10 }} allowDecimals={false} />
          <Tooltip content={<DarkTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <Bar yAxisId="left" dataKey="volunteers" fill={COLOR + '80'} name="Volunteers (week)" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="cumVolunteers" stroke={COLOR} strokeWidth={2.5} dot={{ r: 4, fill: COLOR }} name="Volunteers (cum.)" />
        </ComposedChart>
      </ResponsiveContainer>
      <AIInsightBox
        verdict={health === 'Strong' ? 'On Track' : health === 'Building' ? 'Developing' : 'Needs Push'}
        verdictColor={healthColor}
        text={
          health === 'Strong'
            ? `Strong volunteer base of ${latestVolunteers} this week. Focus on converting volunteers into repeat contributors and building a reliable roster for future events.`
            : health === 'Building'
            ? `${latestVolunteers} volunteers this week. Aim for 10+ per event — recruit via university and community channels to build the pool.`
            : `No volunteers logged yet. Begin outreach to universities and community groups to build your volunteer pipeline.`
        }
      />
    </ChartCard>
  );
}

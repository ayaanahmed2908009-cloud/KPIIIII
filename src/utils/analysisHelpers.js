import { TEAM_KEYS } from '../data/kpiData';

// ─── Year-End Projections ──────────────────────────────────────────────────────
// Pure arithmetic — projects key cumulative KPIs to week 52 at current pace.
// Rate-based KPIs (engagement %, OKR rate) show current rolling average only.

const TOTAL_FY_WEEKS = 52;

function _lastVal(entries, key) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const v = entries[i]?.inputs?.[key];
    if (v !== null && v !== undefined && v !== 0) return v;
  }
  return 0;
}

function _weeklyAvg(entries, key) {
  if (!entries.length) return 0;
  const total = entries.reduce((s, e) => s + (e.inputs?.[key] ?? 0), 0);
  return total / entries.length;
}

function _projStatus(projected, target) {
  if (typeof projected !== 'number' || typeof target !== 'number') return 'neutral';
  if (projected >= target) return 'good';
  if (projected >= target * 0.75) return 'risk';
  return 'critical';
}

export function computeYearEndProjections(history, currentFYWeek) {
  const rem = Math.max(0, TOTAL_FY_WEEKS - currentFYWeek);
  const m  = history.filter(e => e.team === 'marketing');
  const gm = history.filter(e => e.team === 'generalManagement');
  const il = history.filter(e => e.team === 'impactLabs');
  const ev = history.filter(e => e.team === 'events');

  // ── Marketing ──
  const currentFollowers = _lastVal(m, 'totalFollowers');
  const avgNetGain = _weeklyAvg(m, 'netFollowerGain');
  const projFollowers = Math.round(currentFollowers + avgNetGain * rem);
  const totalMentions = m.reduce((s, e) => s + (e.inputs?.pressMentionsConfirmed ?? 0), 0);
  const projMentions = +(totalMentions + _weeklyAvg(m, 'pressMentionsConfirmed') * rem).toFixed(1);

  // ── General Management ──
  const currentMembers = _lastVal(gm, 'totalActiveMembers');
  const avgMemberNet = _weeklyAvg(gm, 'newMembersJoined') - _weeklyAvg(gm, 'membersWhoLeft');
  const projMembers = Math.round(currentMembers + avgMemberNet * rem);
  const okrWeeks = gm.filter(e => (e.inputs?.okrTasksDue ?? 0) > 0);
  const avgOkrRate = okrWeeks.length
    ? Math.round(okrWeeks.reduce((s, e) => s + (e.inputs.okrTasksCompleted / e.inputs.okrTasksDue) * 100, 0) / okrWeeks.length)
    : null;

  // ── Impact Labs ──
  const currentArticles = _lastVal(il, 'totalArticlesPublishedYTD');
  const projArticles = +(currentArticles + _weeklyAvg(il, 'articlesPublishedThisWeek') * rem).toFixed(1);
  const annualReportPct = _lastVal(il, 'annualReportPercentComplete');

  // ── Events ──
  const currentAttendees = _lastVal(ev, 'totalAttendeesYTD');
  const confirmedReg = _lastVal(ev, 'totalConfirmedRegistrations');
  const currentEvents = _lastVal(ev, 'totalEventsYTD');
  const avgEventsPerWeek = _weeklyAvg(ev, 'totalEventsYTD') > 0
    ? _lastVal(ev, 'totalEventsYTD') / ev.length : 0;
  const projAttendees = currentAttendees + confirmedReg;
  const projEvents = +(currentEvents + avgEventsPerWeek * rem).toFixed(1);

  // ── Business Development ──
  const bd = history.filter(e => e.team === 'businessDevelopment');
  const currentRevenue = _lastVal(bd, 'totalRevenueYTD');
  const projRevenue = Math.round(currentRevenue + _weeklyAvg(bd, 'revenueThisWeek') * rem);
  const currentRepeat = _lastVal(bd, 'repeatCustomersTotal');
  const currentChannels = _lastVal(bd, 'activeChannels');
  const feedbackWeeks = bd.filter(e => (e.inputs?.satisfactionResponses ?? 0) > 0);
  const avgSatisfaction = feedbackWeeks.length
    ? +(_weeklyAvg(feedbackWeeks, 'satisfactionScore')).toFixed(1) : null;

  return {
    weeksRemaining: rem,
    hasData: history.length > 0,
    businessDevelopment: [
      { label: 'Revenue YTD', current: `$${currentRevenue.toLocaleString()}`, projected: `$${projRevenue.toLocaleString()}`, target: '$7,000', status: _projStatus(projRevenue, 7000) },
      { label: 'Repeat Customers', current: currentRepeat, projected: null, target: 10, status: _projStatus(currentRepeat, 10) },
      { label: 'Active Channels', current: currentChannels, projected: null, target: 2, status: _projStatus(currentChannels, 2) },
      ...(avgSatisfaction !== null ? [{ label: 'Satisfaction Avg', current: `${avgSatisfaction}/5`, projected: null, target: '>3.5/5', status: avgSatisfaction >= 3.5 ? 'good' : avgSatisfaction >= 3.0 ? 'risk' : 'critical' }] : []),
    ],
    marketing: [
      { label: 'Total Followers', current: currentFollowers, projected: projFollowers, target: 3000, status: _projStatus(projFollowers, 3000) },
      { label: 'Press Mentions', current: totalMentions, projected: projMentions, target: 4, status: _projStatus(projMentions, 4) },
    ],
    generalManagement: [
      { label: 'Active Members', current: currentMembers, projected: projMembers, target: 22, status: _projStatus(projMembers, 22) },
      { label: 'OKR Rate (now)', current: avgOkrRate !== null ? `${avgOkrRate}%` : '—', projected: null, target: '70%', status: avgOkrRate === null ? 'neutral' : avgOkrRate >= 70 ? 'good' : avgOkrRate >= 55 ? 'risk' : 'critical' },
    ],
    impactLabs: [
      { label: 'Articles Published', current: currentArticles, projected: projArticles, target: 8, status: _projStatus(projArticles, 8) },
      { label: 'Annual Report', current: `${annualReportPct}%`, projected: null, target: '100% by Wk 8', status: annualReportPct >= 100 ? 'good' : currentFYWeek <= 8 ? 'risk' : 'critical' },
    ],
    events: [
      { label: 'Total Attendees', current: currentAttendees, projected: projAttendees, target: 300, status: _projStatus(projAttendees, 300), note: confirmedReg ? `+${confirmedReg} confirmed registrations` : null },
      { label: 'Events Organised', current: currentEvents, projected: projEvents > currentEvents ? projEvents : null, target: 3, status: _projStatus(currentEvents, 3) },
    ],
  };
}

// Returns array of team keys that have been below 50% for 6+ consecutive weeks
export function getLeadershipWarnings(analysisHistory) {
  if (!analysisHistory || analysisHistory.length === 0) return [];
  const warnings = [];

  TEAM_KEYS.forEach(team => {
    let consecutiveBelow = 0;
    let consecutiveAbove = 0;
    let triggered = false;

    for (let i = 0; i < analysisHistory.length; i++) {
      const teamData = analysisHistory[i]?.analysis?.[team];
      if (!teamData) continue;
      const prob = teamData.overallProbability ?? 0;
      if (prob < 50) {
        consecutiveBelow++;
        consecutiveAbove = 0;
      } else {
        consecutiveAbove++;
        consecutiveBelow = 0;
      }
      if (consecutiveBelow >= 6) triggered = true;
      if (triggered && consecutiveAbove >= 2) triggered = false;
    }

    if (triggered) warnings.push(team);
  });

  return warnings;
}

// Returns { weeks: number } of how many consecutive weeks a team has been below 50%
export function getConsecutiveBelowWeeks(analysisHistory, teamKey) {
  if (!analysisHistory || analysisHistory.length === 0) return 0;
  let count = 0;
  for (let i = analysisHistory.length - 1; i >= 0; i--) {
    const teamData = analysisHistory[i]?.analysis?.[teamKey];
    if (!teamData) break;
    const prob = teamData.overallProbability ?? 0;
    if (prob < 50) count++;
    else break;
  }
  return count;
}

// Returns the executive composite score from the latest analysis
export function getExecutiveScore(latestAnalysis) {
  if (!latestAnalysis) return null;
  let total = 0;
  let count = 0;
  TEAM_KEYS.forEach(team => {
    const prob = latestAnalysis[team]?.overallProbability;
    if (typeof prob === 'number') { total += prob; count++; }
  });
  return count > 0 ? Math.round(total / count) : null;
}

export function scoreColor(score) {
  if (score === null || score === undefined) return '#6B7280';
  if (score >= 70) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

export function riskColor(riskFlag, probability) {
  if (riskFlag === 'on track' || probability >= 70) return '#10B981';
  if (riskFlag === 'at risk' || probability >= 50) return '#F59E0B';
  return '#EF4444';
}

export function riskBg(riskFlag, probability) {
  if (riskFlag === 'on track' || probability >= 70) return '#D1FAE5';
  if (riskFlag === 'at risk' || probability >= 50) return '#FEF3C7';
  return '#FEE2E2';
}

// Fiscal year: April 1 2026 – March 31 2027
const FY_START = new Date('2026-04-01T00:00:00Z');
const FY_END   = new Date('2027-03-31T23:59:59Z');

// Returns the current FY week number (1–52) based on today's date.
// Before FY starts → returns 1. After FY ends → returns 52.
export function getCurrentFYWeek() {
  const now = new Date();
  if (now < FY_START) return 1;
  if (now > FY_END) return 52;
  const msElapsed = now.getTime() - FY_START.getTime();
  const weekNum = Math.floor(msElapsed / (7 * 24 * 3600 * 1000)) + 1;
  return Math.min(weekNum, 52);
}

// Returns the calendar date range string for a given FY week (1-indexed)
export function getFYWeekDateRange(weekNum) {
  const start = new Date(FY_START.getTime() + (weekNum - 1) * 7 * 24 * 3600 * 1000);
  const end   = new Date(start.getTime() + 6 * 24 * 3600 * 1000);
  const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

// Returns the FY week number for a given ISO date string (used to tag history entries)
export function dateToFYWeek(isoString) {
  const d = new Date(isoString);
  if (d < FY_START) return 1;
  if (d > FY_END) return 52;
  return Math.min(Math.floor((d - FY_START) / (7 * 24 * 3600 * 1000)) + 1, 52);
}

// Legacy fallback — use getCurrentFYWeek() for new code
export function getCurrentWeekNumber(history) {
  const fyWeek = getCurrentFYWeek();
  // If the FY hasn't started yet, derive from history so test data still works
  if (new Date() < FY_START && history.length > 0) {
    return history[history.length - 1].weekNumber + 1;
  }
  return fyWeek;
}

// ─── Commitment Tracker ────────────────────────────────────────────────────────
// Three hard signals per team, each mapped directly to an action:
//   1. Submission record — did they show up the last 4 weeks?
//   2. Probability trend — are they moving toward the goal?
//   3. Combined verdict  — one specific thing leadership should do.
//
// No abstract scores. Output is: status label + action sentence + supporting data.

export function computeTeamCommitment(history, analysisHistory, teamKey, currentFYWeek) {
  const teamHistory = history.filter(e => e.team === teamKey);

  // ── Signal 1: submission record (last 4 FY weeks) ──
  const recentWeeks = [];
  for (let w = currentFYWeek; w > currentFYWeek - 4 && w >= 1; w--) recentWeeks.unshift(w);
  const submittedSet = new Set(teamHistory.map(e => e.weekNumber));
  const submissionRecord = recentWeeks.map(w => ({ week: w, submitted: submittedSet.has(w) }));
  const recentHits = submissionRecord.filter(r => r.submitted).length;
  const missedRecently = submissionRecord.length - recentHits;

  // ── Signal 2: probability trend (last 5 analysis entries) ──
  const probs = analysisHistory
    .map(a => a.analysis?.[teamKey]?.overallProbability)
    .filter(p => typeof p === 'number')
    .slice(-5);

  let consecutiveDecline = 0;
  for (let i = probs.length - 1; i >= 1; i--) {
    if (probs[i] < probs[i - 1] - 1) consecutiveDecline++;
    else break;
  }
  let consecutiveFlat = 0;
  for (let i = probs.length - 1; i >= 1; i--) {
    if (Math.abs(probs[i] - probs[i - 1]) <= 2) consecutiveFlat++;
    else break;
  }
  const probTrend = probs.length < 2 ? 'unknown'
    : probs[probs.length - 1] > probs[probs.length - 2] + 2 ? 'up'
    : probs[probs.length - 1] < probs[probs.length - 2] - 2 ? 'down'
    : 'flat';

  // ── Verdict + action ──
  let status, action, color;

  if (teamHistory.length === 0) {
    status = 'No Data';
    action = 'No submissions received — chase team lead for first entry.';
    color = '#6B7280';
  } else if (missedRecently >= 2 && consecutiveDecline >= 2) {
    status = 'Escalate';
    action = `${missedRecently} missed weeks and probability falling ${consecutiveDecline} weeks straight — escalate to leadership review now.`;
    color = '#EF4444';
  } else if (missedRecently >= 2) {
    status = 'Follow Up';
    action = `${missedRecently} of the last ${submissionRecord.length} weeks have no submission — contact team lead directly.`;
    color = '#F97316';
  } else if (consecutiveDecline >= 3) {
    status = 'Review Strategy';
    action = `Probability has dropped ${consecutiveDecline} weeks in a row despite regular submissions — current approach isn't working. Sit down with team lead.`;
    color = '#F59E0B';
  } else if (consecutiveFlat >= 3 && probs.length >= 3) {
    status = 'Check In';
    action = `No meaningful progress for ${consecutiveFlat} consecutive weeks — check whether goals are understood and blockers are being surfaced.`;
    color = '#F59E0B';
  } else if (recentHits === submissionRecord.length && probTrend === 'up') {
    status = 'On Track';
    action = 'Submitting every week and probability improving — no action needed.';
    color = '#10B981';
  } else {
    status = 'Monitor';
    action = 'Submitting regularly but trend is unclear — revisit in 2 weeks.';
    color = '#3B82F6';
  }

  return { status, action, color, submissionRecord, recentHits, probs, probTrend, consecutiveDecline };
}

export function formatDate(isoString) {
  if (!isoString) return 'Never';
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

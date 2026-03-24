import { TEAM_KEYS } from '../data/kpiData';

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

export function formatDate(isoString) {
  if (!isoString) return 'Never';
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

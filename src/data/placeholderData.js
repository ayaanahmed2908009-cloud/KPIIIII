// Shared chart utility functions — no placeholder/sample data in production

// Pace line generator: straight line from 0 to target over 52 weeks
export function pacePoint(week, target) {
  return parseFloat(((target / 52) * week).toFixed(1));
}

// Extract chart data from real history entries for a given team
export function extractTeamData(history, teamKey) {
  return history
    .filter(e => e.team === teamKey)
    .sort((a, b) => a.weekNumber - b.weekNumber);
}

export function hasEnoughData(history, teamKey, minWeeks = 1) {
  return history.filter(e => e.team === teamKey).length >= minWeeks;
}

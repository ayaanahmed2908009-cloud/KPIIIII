// ─── SolarPak Fiscal Year Utility ───────────────────────────────────────────
// Fiscal Year: April 1, 2026 → March 31, 2027
// Week 1 = Apr 1–7, 2026  |  Week 52 = Mar 25–31, 2027

export const FISCAL_START = new Date('2026-04-01T00:00:00');
export const FISCAL_END   = new Date('2027-03-31T23:59:59');
export const FISCAL_LABEL = 'FY 2026–2027';
export const TOTAL_WEEKS  = 52;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Returns {start, end} Date objects for a given fiscal week (1-indexed) */
export function getWeekDates(weekNum) {
  const start = new Date(FISCAL_START);
  start.setDate(start.getDate() + (weekNum - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

/** Short label e.g. "Apr 1–7" or "Dec 28–Jan 3" */
export function getWeekShortLabel(weekNum) {
  const { start, end } = getWeekDates(weekNum);
  const sm = MONTHS[start.getMonth()];
  const em = MONTHS[end.getMonth()];
  const sd = start.getDate();
  const ed = end.getDate();
  if (sm === em) return `${sm} ${sd}–${ed}`;
  return `${sm} ${sd}–${em} ${ed}`;
}

/** Full label e.g. "Week 1 · Apr 1–7, 2026" */
export function getWeekFullLabel(weekNum) {
  const { start, end } = getWeekDates(weekNum);
  const sy = start.getFullYear();
  const ey = end.getFullYear();
  const range = sy === ey
    ? `${MONTHS[start.getMonth()]} ${start.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${sy}`
    : `${MONTHS[start.getMonth()]} ${start.getDate()}, ${sy} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${ey}`;
  return `Week ${weekNum} · ${range}`;
}

/** Returns the current fiscal week number (1–52), 0 = before FY starts, 53 = after FY ends */
export function getCurrentFiscalWeek() {
  const today = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diff = Math.floor((today - FISCAL_START) / msPerWeek);
  if (diff < 0) return 0;        // before fiscal year
  if (diff >= TOTAL_WEEKS) return TOTAL_WEEKS + 1;  // after fiscal year
  return diff + 1;
}

/** Returns whether a given fiscal week is in the past (strictly before the current week) */
export function isWeekPast(weekNum) {
  const current = getCurrentFiscalWeek();
  return weekNum < current;
}

/** Returns whether a given fiscal week is the current live week */
export function isWeekCurrent(weekNum) {
  return weekNum === getCurrentFiscalWeek();
}

/** Returns whether a given fiscal week is in the future */
export function isWeekFuture(weekNum) {
  const current = getCurrentFiscalWeek();
  return current === 0 ? true : weekNum > current;
}

/** Quarter label for a given week (1-indexed) */
export function getQuarterLabel(weekNum) {
  if (weekNum <= 13) return 'Q1 · Apr–Jun 2026';
  if (weekNum <= 26) return 'Q2 · Jul–Sep 2026';
  if (weekNum <= 39) return 'Q3 · Oct–Dec 2026';
  return 'Q4 · Jan–Mar 2027';
}

/** Which quarter (1-4) a week belongs to */
export function getQuarter(weekNum) {
  if (weekNum <= 13) return 1;
  if (weekNum <= 26) return 2;
  if (weekNum <= 39) return 3;
  return 4;
}

/** Group weeks 1-52 into 4 quarters */
export function getQuarterGroups() {
  return [
    { label: 'Q1 · Apr–Jun 2026', weeks: range(1, 13) },
    { label: 'Q2 · Jul–Sep 2026', weeks: range(14, 26) },
    { label: 'Q3 · Oct–Dec 2026', weeks: range(27, 39) },
    { label: 'Q4 · Jan–Mar 2027', weeks: range(40, 52) },
  ];
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** Given history entries for a team, which fiscal weeks have submissions? */
export function getSubmittedWeeks(history, teamKey) {
  return new Set(
    history
      .filter(e => !teamKey || e.team === teamKey)
      .map(e => e.weekNumber)
  );
}

/** Given history, get the submission entries for a specific week */
export function getWeekEntries(history, weekNum) {
  return history.filter(e => e.weekNumber === weekNum);
}

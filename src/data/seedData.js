// ─────────────────────────────────────────────────────────────────────────────
// SolarPak Trial-Week Seed Data
// Two pre-FY trial weeks (before the fiscal year officially starts Apr 1, 2026):
//   Trial Week 1  →  11 Mar – 17 Mar 2026  (weekNumber: -1)
//   Trial Week 2  →  18 Mar – 25 Mar 2026  (weekNumber:  0)
//
// Negative / zero week numbers keep trial data entirely separate from FY weeks 1–52.
// The WeekTimeline renders a dedicated "Trial Period" section for these.
// In charts, use: tickFormatter={w => w < 1 ? `T${w + 2}` : `Wk ${w}`}
// ─────────────────────────────────────────────────────────────────────────────

export const TRIAL_WEEK_DATES = {
  '-1': { label: 'Trial Wk 1', dates: '11–17 Mar 2026' },
   '0': { label: 'Trial Wk 2', dates: '18–25 Mar 2026' },
};

// Helper: given a week number, return a short display label
export function weekLabel(w) {
  if (w === -1) return 'T1';
  if (w === 0)  return 'T2';
  return `Wk ${w}`;
}

// No pre-loaded seed entries — charts start empty and fill with real weekly submissions.
// Marketing follower baseline as of 25 Mar 2026: 1,847 (see FOLLOWER_BASELINE in MarketingCharts.js)
export const SEED_ENTRIES = [];

export const SEED_FLAG_KEY = 'solarpak_trial_seeded';

export function isSeedLoaded() {
  try { return localStorage.getItem(SEED_FLAG_KEY) === 'true'; } catch { return false; }
}

export function markSeedLoaded() {
  try { localStorage.setItem(SEED_FLAG_KEY, 'true'); } catch {}
}

export function clearSeedFlag() {
  try { localStorage.removeItem(SEED_FLAG_KEY); } catch {}
}

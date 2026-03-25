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

export const SEED_ENTRIES = [

  // ── MARKETING ──────────────────────────────────────────────────────────────
  {
    weekNumber: -1,
    team: 'marketing',
    dateSubmitted: '2026-03-17T14:00:00.000Z',
    isTrial: true,
    inputs: {
      postsPublished: 3,
      videosPublished: 1,
      netFollowerGain: 57,
      totalFollowers: 1790,
      avgEngagementRate: 2.7,
      pressContactsReached: 1,
      pressMentionsConfirmed: 0,
    },
  },
  {
    weekNumber: 0,
    team: 'marketing',
    dateSubmitted: '2026-03-24T14:00:00.000Z',
    isTrial: true,
    inputs: {
      postsPublished: 4,
      videosPublished: 2,
      netFollowerGain: 57,
      totalFollowers: 1847,
      avgEngagementRate: 3.1,
      pressContactsReached: 3,
      pressMentionsConfirmed: 1,
    },
  },

  // ── SPONSORSHIPS ───────────────────────────────────────────────────────────
  {
    weekNumber: -1,
    team: 'sponsorships',
    dateSubmitted: '2026-03-17T14:00:00.000Z',
    isTrial: true,
    inputs: {
      outreachMeetingsHeld: 1,
      prospectsOutreachStage: 4,
      prospectsMeetingStage: 1,
      newPartnershipsFormalised: 0,
      totalActivePartners: 0,
      fundsRaisedThisWeek: 0,
      totalFundsRaisedYTD: 0,
    },
  },
  {
    weekNumber: 0,
    team: 'sponsorships',
    dateSubmitted: '2026-03-24T14:00:00.000Z',
    isTrial: true,
    inputs: {
      outreachMeetingsHeld: 2,
      prospectsOutreachStage: 7,
      prospectsMeetingStage: 2,
      newPartnershipsFormalised: 0,
      totalActivePartners: 0,
      fundsRaisedThisWeek: 250,
      totalFundsRaisedYTD: 250,
    },
  },

  // ── GENERAL MANAGEMENT ────────────────────────────────────────────────────
  {
    weekNumber: -1,
    team: 'generalManagement',
    dateSubmitted: '2026-03-17T14:00:00.000Z',
    isTrial: true,
    inputs: {
      newMembersJoined: 3,
      membersWhoLeft: 0,
      totalActiveMembers: 14,
      okrTasksCompleted: 6,
      okrTasksDue: 8,
      probabilityAchievementScore: 68,
      workerSatisfactionSurvey: 0,
      surveyRespondents: 0,
    },
  },
  {
    weekNumber: 0,
    team: 'generalManagement',
    dateSubmitted: '2026-03-24T14:00:00.000Z',
    isTrial: true,
    inputs: {
      newMembersJoined: 2,
      membersWhoLeft: 0,
      totalActiveMembers: 16,
      okrTasksCompleted: 8,
      okrTasksDue: 10,
      probabilityAchievementScore: 72,
      workerSatisfactionSurvey: 87,
      surveyRespondents: 14,
    },
  },

  // ── IMPACT LABS ───────────────────────────────────────────────────────────
  {
    weekNumber: -1,
    team: 'impactLabs',
    dateSubmitted: '2026-03-17T14:00:00.000Z',
    isTrial: true,
    inputs: {
      articlesResearchStage: 2,
      articlesDraftStage: 1,
      articlesReviewStage: 0,
      articlesPublishedThisWeek: 0,
      totalArticlesPublishedYTD: 0,
      aiQualityScore: 0,
      dataPointsVerified: 8,
      dataAccuracyAuditScore: 0,
      externalCitationsConfirmed: 0,
      findingsSubmittedExternally: 0,
      annualReportPercentComplete: 5,
    },
  },
  {
    weekNumber: 0,
    team: 'impactLabs',
    dateSubmitted: '2026-03-24T14:00:00.000Z',
    isTrial: true,
    inputs: {
      articlesResearchStage: 3,
      articlesDraftStage: 2,
      articlesReviewStage: 1,
      articlesPublishedThisWeek: 0,
      totalArticlesPublishedYTD: 0,
      aiQualityScore: 81,
      dataPointsVerified: 13,
      dataAccuracyAuditScore: 83,
      externalCitationsConfirmed: 0,
      findingsSubmittedExternally: 1,
      annualReportPercentComplete: 10,
    },
  },

  // ── EVENTS ────────────────────────────────────────────────────────────────
  {
    weekNumber: -1,
    team: 'events',
    dateSubmitted: '2026-03-17T14:00:00.000Z',
    isTrial: true,
    inputs: {
      eventsHeldThisWeek: 0,
      totalEventsYTD: 0,
      attendeesThisWeek: 0,
      totalAttendeesYTD: 0,
      attendeeSatisfactionScore: 0,
      repeatAttendeePercentage: 0,
      eventSponsorsSecured: 0,
      volunteersEngaged: 4,
      schoolsReachedYTD: 0,
    },
  },
  {
    weekNumber: 0,
    team: 'events',
    dateSubmitted: '2026-03-24T14:00:00.000Z',
    isTrial: true,
    inputs: {
      eventsHeldThisWeek: 0,
      totalEventsYTD: 0,
      attendeesThisWeek: 0,
      totalAttendeesYTD: 0,
      attendeeSatisfactionScore: 0,
      repeatAttendeePercentage: 0,
      eventSponsorsSecured: 0,
      volunteersEngaged: 6,
      schoolsReachedYTD: 1,
    },
  },
];

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

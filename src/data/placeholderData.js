// Realistic 8-week placeholder dataset for a solar energy nonprofit in Year 1
// Used when insufficient real data exists — clearly labelled as sample data

export const PLACEHOLDER = {
  marketing: [
    { week: 1, followers: 1650, engagementRate: 3.2, posts: 3, videos: 1, pressContacts: 2, pressMentions: 0, cumulativeMentions: 0 },
    { week: 2, followers: 1690, engagementRate: 2.8, posts: 4, videos: 2, pressContacts: 3, pressMentions: 0, cumulativeMentions: 0 },
    { week: 3, followers: 1720, engagementRate: 3.5, posts: 3, videos: 1, pressContacts: 2, pressMentions: 1, cumulativeMentions: 1 },
    { week: 4, followers: 1750, engagementRate: 3.1, posts: 5, videos: 2, pressContacts: 4, pressMentions: 0, cumulativeMentions: 1 },
    { week: 5, followers: 1775, engagementRate: 2.9, posts: 4, videos: 2, pressContacts: 3, pressMentions: 0, cumulativeMentions: 1 },
    { week: 6, followers: 1800, engagementRate: 3.4, posts: 3, videos: 1, pressContacts: 2, pressMentions: 1, cumulativeMentions: 2 },
    { week: 7, followers: 1825, engagementRate: 3.7, posts: 4, videos: 2, pressContacts: 5, pressMentions: 0, cumulativeMentions: 2 },
    { week: 8, followers: 1847, engagementRate: 3.3, posts: 4, videos: 2, pressContacts: 3, pressMentions: 0, cumulativeMentions: 2 },
  ],
  sponsorships: [
    { week: 1, meetings: 2, prospectsOutreach: 5, prospectsMeeting: 1, newPartnerships: 0, totalPartners: 0, fundsWeek: 0,    fundsYTD: 0 },
    { week: 2, meetings: 3, prospectsOutreach: 6, prospectsMeeting: 2, newPartnerships: 0, totalPartners: 0, fundsWeek: 500,  fundsYTD: 500 },
    { week: 3, meetings: 2, prospectsOutreach: 5, prospectsMeeting: 2, newPartnerships: 0, totalPartners: 0, fundsWeek: 250,  fundsYTD: 750 },
    { week: 4, meetings: 4, prospectsOutreach: 7, prospectsMeeting: 3, newPartnerships: 0, totalPartners: 0, fundsWeek: 0,    fundsYTD: 750 },
    { week: 5, meetings: 3, prospectsOutreach: 6, prospectsMeeting: 2, newPartnerships: 0, totalPartners: 0, fundsWeek: 750,  fundsYTD: 1500 },
    { week: 6, meetings: 2, prospectsOutreach: 5, prospectsMeeting: 3, newPartnerships: 1, totalPartners: 1, fundsWeek: 1200, fundsYTD: 2700 },
    { week: 7, meetings: 3, prospectsOutreach: 7, prospectsMeeting: 3, newPartnerships: 0, totalPartners: 1, fundsWeek: 300,  fundsYTD: 3000 },
    { week: 8, meetings: 4, prospectsOutreach: 8, prospectsMeeting: 4, newPartnerships: 0, totalPartners: 1, fundsWeek: 0,    fundsYTD: 3000 },
  ],
  generalManagement: [
    { week: 1, joined: 1, left: 0, total: 15, okrCompleted: 5,  okrDue: 8,  selfAssessed: 65, satisfaction: 0,  respondents: 0 },
    { week: 2, joined: 1, left: 1, total: 15, okrCompleted: 7,  okrDue: 9,  selfAssessed: 68, satisfaction: 0,  respondents: 0 },
    { week: 3, joined: 0, left: 0, total: 15, okrCompleted: 6,  okrDue: 9,  selfAssessed: 70, satisfaction: 88, respondents: 13 },
    { week: 4, joined: 2, left: 0, total: 17, okrCompleted: 8,  okrDue: 11, selfAssessed: 72, satisfaction: 0,  respondents: 0 },
    { week: 5, joined: 1, left: 0, total: 18, okrCompleted: 7,  okrDue: 10, selfAssessed: 75, satisfaction: 0,  respondents: 0 },
    { week: 6, joined: 0, left: 1, total: 17, okrCompleted: 8,  okrDue: 10, selfAssessed: 71, satisfaction: 0,  respondents: 0 },
    { week: 7, joined: 1, left: 0, total: 18, okrCompleted: 9,  okrDue: 12, selfAssessed: 74, satisfaction: 0,  respondents: 0 },
    { week: 8, joined: 1, left: 0, total: 19, okrCompleted: 8,  okrDue: 11, selfAssessed: 78, satisfaction: 0,  respondents: 0 },
  ],
  impactLabs: [
    { week: 1, research: 3, draft: 1, review: 0, publishedWeek: 0, publishedYTD: 0, aiScore: 0,  dataPoints: 12, auditScore: 0,  citations: 0, submitted: 0, reportPct: 10 },
    { week: 2, research: 3, draft: 2, review: 1, publishedWeek: 0, publishedYTD: 0, aiScore: 82, dataPoints: 15, auditScore: 0,  citations: 0, submitted: 1, reportPct: 10 },
    { week: 3, research: 4, draft: 1, review: 1, publishedWeek: 0, publishedYTD: 0, aiScore: 0,  dataPoints: 18, auditScore: 85, citations: 0, submitted: 0, reportPct: 15 },
    { week: 4, research: 3, draft: 2, review: 1, publishedWeek: 1, publishedYTD: 1, aiScore: 85, dataPoints: 14, auditScore: 0,  citations: 0, submitted: 1, reportPct: 15 },
    { week: 5, research: 4, draft: 2, review: 1, publishedWeek: 0, publishedYTD: 1, aiScore: 0,  dataPoints: 16, auditScore: 0,  citations: 0, submitted: 0, reportPct: 20 },
    { week: 6, research: 4, draft: 3, review: 1, publishedWeek: 1, publishedYTD: 2, aiScore: 88, dataPoints: 20, auditScore: 0,  citations: 1, submitted: 1, reportPct: 20 },
    { week: 7, research: 3, draft: 2, review: 2, publishedWeek: 0, publishedYTD: 2, aiScore: 0,  dataPoints: 18, auditScore: 0,  citations: 0, submitted: 1, reportPct: 25 },
    { week: 8, research: 4, draft: 3, review: 1, publishedWeek: 1, publishedYTD: 3, aiScore: 84, dataPoints: 22, auditScore: 0,  citations: 0, submitted: 0, reportPct: 25 },
  ],
  events: [
    { week: 1, eventsHeld: 0, eventsYTD: 0, attendees: 0,  attendeesYTD: 0,  satisfaction: 0,  repeatPct: 0,  sponsors: 0, volunteers: 3,  schoolsReached: 0 },
    { week: 2, eventsHeld: 0, eventsYTD: 0, attendees: 0,  attendeesYTD: 0,  satisfaction: 0,  repeatPct: 0,  sponsors: 0, volunteers: 4,  schoolsReached: 0 },
    { week: 3, eventsHeld: 0, eventsYTD: 0, attendees: 0,  attendeesYTD: 0,  satisfaction: 0,  repeatPct: 0,  sponsors: 0, volunteers: 5,  schoolsReached: 1 },
    { week: 4, eventsHeld: 1, eventsYTD: 1, attendees: 45, attendeesYTD: 45, satisfaction: 82, repeatPct: 0,  sponsors: 0, volunteers: 8,  schoolsReached: 1 },
    { week: 5, eventsHeld: 0, eventsYTD: 1, attendees: 0,  attendeesYTD: 45, satisfaction: 0,  repeatPct: 0,  sponsors: 1, volunteers: 5,  schoolsReached: 2 },
    { week: 6, eventsHeld: 1, eventsYTD: 2, attendees: 62, attendeesYTD: 107, satisfaction: 87, repeatPct: 18, sponsors: 1, volunteers: 11, schoolsReached: 2 },
    { week: 7, eventsHeld: 0, eventsYTD: 2, attendees: 0,  attendeesYTD: 107, satisfaction: 0, repeatPct: 0,  sponsors: 0, volunteers: 6,  schoolsReached: 3 },
    { week: 8, eventsHeld: 2, eventsYTD: 4, attendees: 88, attendeesYTD: 195, satisfaction: 91, repeatPct: 24, sponsors: 0, volunteers: 14, schoolsReached: 3 },
  ]
};

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

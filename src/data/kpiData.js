export const TEAM_COLORS = {
  marketing: '#3B82F6',
  generalManagement: '#8B5CF6',
  impactLabs: '#F59E0B',
  events: '#EF4444'
};

export const TEAM_LABELS = {
  marketing: 'Marketing & Social Media',
  generalManagement: 'General Management',
  impactLabs: 'Impact Labs',
  events: 'Events & Community Outreach'
};

export const KPI_DIRECTORY = {
  marketing: {
    label: 'Marketing & Social Media',
    color: '#3B82F6',
    kpis: [
      {
        id: 'totalFollowers',
        name: 'Total Social Following',
        description: 'Cumulative number of followers across all social media platforms managed by the team.',
        targets: { year1: '3,000', year2: '6,000', year3: '10,000' },
        feedingFields: ['Total followers right now', 'Net follower gain this week'],
        probabilityCalc: 'Projects current follower count toward 3,000 based on the average weekly net gain observed across all submitted weeks.',
        frequency: 'Weekly'
      },
      {
        id: 'engagementRate',
        name: 'Avg Engagement Rate',
        description: 'Average percentage of followers who interact with published content each week.',
        targets: { year1: '2–4%', year2: '5–6%', year3: '8%+' },
        feedingFields: ['Average engagement rate this week'],
        probabilityCalc: 'Computes a rolling average of weekly engagement rates and assesses likelihood it stays within the 2–4% target band for Year 1.',
        frequency: 'Weekly'
      },
      {
        id: 'postsPerMonth',
        name: 'Posts Published Per Month',
        description: 'Number of content posts published across all channels each calendar month.',
        targets: { year1: '12', year2: '12', year3: '12' },
        feedingFields: ['Posts published this week'],
        probabilityCalc: 'Sums weekly posts into monthly buckets and estimates the probability of consistently reaching 12 posts per month for the remainder of the year.',
        frequency: 'Weekly'
      },
      {
        id: 'postVideoRatio',
        name: 'Post to Video Ratio',
        description: 'Ratio of standard posts to video posts, targeting a 1:2 mix in Year 1.',
        targets: { year1: '1:2', year2: '1:1', year3: '2:1' },
        feedingFields: ['Posts published this week', 'Videos published this week'],
        probabilityCalc: 'Calculates the cumulative YTD ratio of posts to videos and scores probability based on how close the ratio is to 1:2.',
        frequency: 'Weekly'
      },
      {
        id: 'pressMentions',
        name: 'Press Mentions Per Year',
        description: 'Number of confirmed press mentions or media features secured during the year.',
        targets: { year1: '4', year2: '10', year3: '20' },
        feedingFields: ['Press mentions confirmed this week', 'Press contacts reached out to this week'],
        probabilityCalc: 'Projects confirmed press mentions YTD toward the annual target of 4, weighted by the outreach pipeline activity.',
        frequency: 'Weekly'
      }
    ]
  },
  generalManagement: {
    label: 'General Management',
    color: '#8B5CF6',
    kpis: [
      {
        id: 'activeMembers',
        name: 'Active Team Members',
        description: 'Total number of active, engaged team members across all departments (baseline was 14).',
        targets: { year1: '22', year2: '40', year3: '70' },
        feedingFields: ['Total active members right now', 'New members joined this week', 'Members who left or went inactive this week'],
        probabilityCalc: 'Projects current headcount toward 22 using the net weekly change (joins minus departures).',
        frequency: 'Weekly'
      },
      {
        id: 'retentionRate',
        name: 'Member Retention Rate',
        description: 'Percentage of members who remain active over a rolling period, measuring team stability.',
        targets: { year1: '80%', year2: '85%', year3: '90%' },
        feedingFields: ['Members who left or went inactive this week', 'Total active members right now'],
        probabilityCalc: 'Calculates churn rate from weekly departures versus total active members and estimates the probability of sustaining 80% retention.',
        frequency: 'Weekly'
      },
      {
        id: 'okrCompletionRate',
        name: 'OKR Completion Rate',
        description: 'Percentage of scheduled OKR tasks completed on time across all teams.',
        targets: { year1: '70%', year2: '75%', year3: '80%' },
        feedingFields: ['OKR tasks completed this week', 'Total OKR tasks due this week'],
        probabilityCalc: 'Averages the weekly completion rate (tasks completed / tasks due) across all submitted weeks and projects against 70%.',
        frequency: 'Weekly'
      },
      {
        id: 'probabilityAchievementScore',
        name: 'Probability Achievement Score',
        description: 'Self-assessed weekly score from the team lead estimating overall KPI achievement probability, cross-validated by AI.',
        targets: { year1: '>70%', year2: '>75%', year3: '>80%' },
        feedingFields: ['Probability achievement score this week, self-assessed %'],
        probabilityCalc: 'Averages self-assessed weekly scores and cross-checks against AI-calculated probability to flag divergence.',
        frequency: 'Weekly'
      },
      {
        id: 'workerSatisfaction',
        name: 'Worker Satisfaction Survey',
        description: 'Percentage of team members who report being satisfied in quarterly pulse surveys.',
        targets: { year1: '≥90%', year2: '≥90%', year3: '≥90%' },
        feedingFields: ['Worker satisfaction survey % satisfied (QUARTERLY)', 'Number of survey respondents (QUARTERLY)'],
        probabilityCalc: 'Uses the most recent quarterly survey result to estimate probability of maintaining ≥90% satisfaction, with confidence adjusted for respondent count.',
        frequency: 'Quarterly'
      }
    ]
  },
  impactLabs: {
    label: 'Impact Labs',
    color: '#F59E0B',
    kpis: [
      {
        id: 'annualReport',
        name: 'Annual Impact Report Published',
        description: 'Whether SolarPak publishes its annual impact report before year-end.',
        targets: { year1: '1 report', year2: '1 report', year3: '1 report' },
        feedingFields: ['Annual impact report % complete'],
        probabilityCalc: 'Uses current report completion percentage and the remaining weeks in the year to estimate the probability of finishing before year-end.',
        frequency: 'Monthly update (enter 0 in non-update weeks)'
      },
      {
        id: 'articlesPublished',
        name: 'Research Articles Published',
        description: 'Number of completed and published research articles produced by Impact Labs.',
        targets: { year1: '8', year2: '8', year3: '8' },
        feedingFields: ['Total articles published YTD', 'Articles published this week'],
        probabilityCalc: 'Projects current YTD article count toward 8 using the average weekly publication rate.',
        frequency: 'Weekly'
      },
      {
        id: 'dataAccuracyAudit',
        name: 'Data Accuracy Audit Score',
        description: 'Score from a formal quarterly audit of data quality across all Impact Labs outputs.',
        targets: { year1: '85%', year2: '92%', year3: '97%' },
        feedingFields: ['Data accuracy audit score (QUARTERLY)', 'Data points verified or updated this week'],
        probabilityCalc: 'Uses the most recent quarterly audit score and weekly verification activity to estimate probability of sustaining an 85% audit score.',
        frequency: 'Quarterly (with weekly proxy activity)'
      },
      {
        id: 'reportQualityScore',
        name: 'Report Quality AI Score',
        description: 'AI-assessed quality score (0–100) of research reports reviewed by the team.',
        targets: { year1: '>85', year2: '>90', year3: '>95' },
        feedingFields: ['AI quality score of any report reviewed this week'],
        probabilityCalc: 'Averages all non-zero weekly AI quality scores and estimates the probability of consistently scoring above 85.',
        frequency: 'Weekly (enter 0 if no report reviewed)'
      },
      {
        id: 'externalCitations',
        name: 'External Citations Per Year',
        description: 'Number of times SolarPak research or findings are cited by external parties.',
        targets: { year1: '2', year2: '8', year3: '20' },
        feedingFields: ['External citations confirmed this week', 'SolarPak findings submitted externally this week'],
        probabilityCalc: 'Projects cumulative confirmed citations toward 2 using current pace, with a boost from recent external submission activity in a 6-week rolling window.',
        frequency: 'Weekly'
      },
      {
        id: 'researchPartnerships',
        name: 'Research Institution Partnerships',
        description: 'Number of universities or research institutions with a signed MOU or formal partnership agreement for joint research with Impact Labs.',
        targets: { year1: '2', year2: '5', year3: '10' },
        feedingFields: ['Institutions partnered (cumulative)', 'Joint projects currently active', 'Co-authored publications YTD', 'Partnership pipeline count', 'Grant proposals submitted YTD'],
        probabilityCalc: 'Projects cumulative institutions partnered toward the annual target using current signing pace, boosted by pipeline size as a leading indicator of future conversions.',
        frequency: 'Weekly'
      }
    ]
  },
  events: {
    label: 'Events & Community Outreach',
    color: '#EF4444',
    kpis: [
      {
        id: 'eventsOrganised',
        name: 'Events Organised Per Year',
        description: 'Total number of events planned and executed by the team during the year.',
        targets: { year1: '3', year2: '7', year3: '15' },
        feedingFields: ['Total events held YTD', 'Weeks until next event', '% complete on planning for next event'],
        probabilityCalc: 'Projects events completed YTD toward 3; upcoming pipeline (planning % and weeks away) counts as a leading indicator that the next event will complete on time.',
        frequency: 'Weekly'
      },
      {
        id: 'eventPipelineHealth',
        name: 'Event Pipeline & Planning Health',
        description: 'Whether events are being actively and systematically planned — measured independently of whether an event is currently live.',
        targets: { year1: 'Consistent week-on-week planning progress', year2: 'Consistent week-on-week planning progress', year3: 'Consistent week-on-week planning progress' },
        feedingFields: ['% complete on planning for next event', 'Key milestones confirmed this week', 'Weeks until next event'],
        probabilityCalc: 'Averages weekly planning progress and milestone confirmation activity. Rewards steady week-over-week increases in planning %, even in non-event weeks.',
        frequency: 'Weekly'
      },
      {
        id: 'weeklyEngagementActivity',
        name: 'Weekly Engagement Activity',
        description: 'Consistent effort toward events through planning hours, outreach contacts, and promotional work each week — always measurable regardless of whether an event is live.',
        targets: { year1: '≥5 hrs/wk average · ≥3 outreach contacts/wk', year2: '≥8 hrs/wk · ≥5 contacts/wk', year3: '≥12 hrs/wk · ≥8 contacts/wk' },
        feedingFields: ['Hours spent on event-related work this week', 'Outreach contacts made this week', 'Promo/marketing pieces published or drafted this week'],
        probabilityCalc: 'Averages weekly planning hours and outreach contacts across all submitted weeks. Probability rises with consistent non-zero effort even during non-event periods.',
        frequency: 'Weekly'
      },
      {
        id: 'totalAttendees',
        name: 'Total Event Attendees',
        description: 'Cumulative count of attendees across all events held during the year, supplemented by confirmed registrations for upcoming events.',
        targets: { year1: '300', year2: '1,000', year3: '3,000' },
        feedingFields: ['Total attendees YTD (cumulative)', 'Total confirmed registrations for next event so far'],
        probabilityCalc: 'Projects total YTD attendees plus confirmed pipeline registrations toward 300. Cumulative metric — only goes up.',
        frequency: 'Weekly'
      },
      {
        id: 'postEventQuality',
        name: 'Post-Event Quality Score',
        description: 'Combined quality assessment across event weeks only: attendee satisfaction, repeat attendee rate, and post-event follow-through. Zero-input weeks (no event) are treated as neutral — not penalised.',
        targets: { year1: 'Satisfaction ≥4.0/5 · Repeat ≥15% · Follow-through ≥80%', year2: 'Satisfaction ≥4.3/5 · Repeat ≥25% · Follow-through ≥85%', year3: 'Satisfaction ≥4.5/5 · Repeat ≥35% · Follow-through ≥90%' },
        feedingFields: ['Did an event occur this week? (trigger)', 'Post-event satisfaction score (out of 5) (EVENT-TRIGGERED)', 'Repeat attendee percentage (%) (EVENT-TRIGGERED)', '% of post-event actions completed (EVENT-TRIGGERED)'],
        probabilityCalc: 'Averages satisfaction scores, repeat rates, and follow-through percentages across event weeks ONLY. Weeks with no event are skipped entirely — not scored as zero.',
        frequency: 'Event-triggered'
      }
    ]
  }
};

export const TEAM_KEYS = ['marketing', 'generalManagement', 'impactLabs', 'events'];

export const DEFAULT_WEEK_INPUTS = {
  marketing: {
    postsPublished: 0,
    videosPublished: 0,
    netFollowerGain: 0,
    totalFollowers: 0,
    avgEngagementRate: 0,
    pressContactsReached: 0,
    pressMentionsConfirmed: 0
  },
  generalManagement: {
    newMembersJoined: 0,
    membersWhoLeft: 0,
    totalActiveMembers: 0,
    okrTasksCompleted: 0,
    okrTasksDue: 0,
    probabilityAchievementScore: 0,
    workerSatisfactionSurvey: 0,
    surveyRespondents: 0
  },
  impactLabs: {
    articlesResearchStage: 0,
    articlesDraftStage: 0,
    articlesReviewStage: 0,
    articlesPublishedThisWeek: 0,
    totalArticlesPublishedYTD: 0,
    aiQualityScore: 0,
    dataPointsVerified: 0,
    dataAccuracyAuditScore: 0,
    externalCitationsConfirmed: 0,
    findingsSubmittedExternally: 0,
    annualReportPercentComplete: 0,
    institutionsPartnered: 0,
    jointProjectsActive: 0,
    coAuthoredPublicationsYTD: 0,
    partnershipPipelineCount: 0,
    grantProposalsSubmitted: 0
  },
  events: {
    eventOccurredThisWeek: 0,
    totalEventsYTD: 0,
    nextEventPlanningPercent: 0,
    nextEventWeeksAway: 0,
    milestonesConfirmedThisWeek: 0,
    eventPlanningHoursThisWeek: 0,
    outreachContactsMade: 0,
    promoMaterialsCreated: 0,
    totalConfirmedRegistrations: 0,
    totalAttendeesYTD: 0,
    attendeeSatisfactionScore: 0,
    repeatAttendeePercentage: 0,
    postEventActionsPercent: 0
  }
};

export const TEAM_INPUT_FIELDS = {
  marketing: [
    { key: 'postsPublished', label: 'Posts published this week', type: 'integer', note: '' },
    { key: 'videosPublished', label: 'Videos published this week', type: 'integer', note: '' },
    { key: 'netFollowerGain', label: 'Net follower gain this week', type: 'integer', note: 'Can be negative' },
    { key: 'totalFollowers', label: 'Total followers right now', type: 'integer', note: 'Current absolute count' },
    { key: 'avgEngagementRate', label: 'Average engagement rate this week (%)', type: 'decimal', note: 'e.g. 3.2' },
    { key: 'pressContactsReached', label: 'Press contacts reached out to this week', type: 'integer', note: '' },
    { key: 'pressMentionsConfirmed', label: 'Press mentions confirmed this week', type: 'integer', note: '' }
  ],
  generalManagement: [
    { key: 'newMembersJoined', label: 'New members joined this week', type: 'integer', note: '' },
    { key: 'membersWhoLeft', label: 'Members who left or went inactive this week', type: 'integer', note: '' },
    { key: 'totalActiveMembers', label: 'Total active members right now', type: 'integer', note: 'Current absolute count' },
    { key: 'okrTasksCompleted', label: 'OKR tasks completed this week', type: 'integer', note: '' },
    { key: 'okrTasksDue', label: 'Total OKR tasks due this week', type: 'integer', note: '' },
    { key: 'probabilityAchievementScore', label: 'Probability achievement score, self-assessed (%)', type: 'decimal', note: 'AI will cross-check this' },
    { key: 'workerSatisfactionSurvey', label: 'Worker satisfaction survey % satisfied', type: 'decimal', badge: 'QUARTERLY', note: 'Enter 0 in non-survey weeks' },
    { key: 'surveyRespondents', label: 'Number of survey respondents', type: 'integer', badge: 'QUARTERLY', note: 'Enter 0 in non-survey weeks' }
  ],
  impactLabs: [
    { key: 'articlesResearchStage', label: 'Articles in research stage', type: 'integer', note: 'Infographic only' },
    { key: 'articlesDraftStage', label: 'Articles in draft stage', type: 'integer', note: 'Infographic only' },
    { key: 'articlesReviewStage', label: 'Articles in review stage', type: 'integer', note: 'Infographic only' },
    { key: 'articlesPublishedThisWeek', label: 'Articles published this week', type: 'integer', note: '' },
    { key: 'totalArticlesPublishedYTD', label: 'Total articles published YTD', type: 'integer', note: 'Current absolute count' },
    { key: 'aiQualityScore', label: 'AI quality score of report reviewed this week (0–100)', type: 'decimal', note: 'Enter 0 if no report reviewed' },
    { key: 'dataPointsVerified', label: 'Data points verified or updated this week', type: 'integer', note: '' },
    { key: 'dataAccuracyAuditScore', label: 'Data accuracy audit score (%)', type: 'decimal', badge: 'QUARTERLY', note: 'Enter 0 in non-audit weeks' },
    { key: 'externalCitationsConfirmed', label: 'External citations confirmed this week', type: 'integer', note: '' },
    { key: 'findingsSubmittedExternally', label: 'SolarPak findings submitted externally this week', type: 'binary', note: '1 = yes, 0 = no' },
    { key: 'annualReportPercentComplete', label: 'Annual impact report % complete', type: 'integer', note: 'Enter 0 in non-update weeks; update monthly' },
    { key: 'institutionsPartnered', label: 'Research institutions partnered (cumulative, signed agreements)', type: 'integer', note: 'Current absolute count — only goes up' },
    { key: 'jointProjectsActive', label: 'Joint research projects currently active', type: 'integer', note: 'Live count — can go up or down' },
    { key: 'coAuthoredPublicationsYTD', label: 'Co-authored publications YTD', type: 'integer', note: 'Current absolute count — only goes up' },
    { key: 'partnershipPipelineCount', label: 'Institutions in active partnership conversations (no agreement yet)', type: 'integer', note: 'Leading indicator' },
    { key: 'grantProposalsSubmitted', label: 'Grant proposals submitted YTD (joint)', type: 'integer', note: 'Enter 0 in non-submission weeks; cumulative' }
  ],
  events: [
    { key: 'eventOccurredThisWeek', label: 'Did an event occur this week?', type: 'binary', note: '1 = yes, 0 = no — activates event-triggered fields below' },
    { key: 'totalEventsYTD', label: 'Total events held YTD', type: 'integer', note: 'Cumulative absolute count — only goes up' },
    { key: 'nextEventPlanningPercent', label: '% complete on planning for next event', type: 'integer', note: '0–100; update weekly to show steady progress' },
    { key: 'nextEventWeeksAway', label: 'Weeks until next event', type: 'integer', note: 'Pipeline health; enter 0 if no upcoming event planned yet' },
    { key: 'milestonesConfirmedThisWeek', label: 'Key event milestones confirmed this week', type: 'integer', note: 'e.g. venue, speakers, sponsors, catering, AV' },
    { key: 'eventPlanningHoursThisWeek', label: 'Hours spent on event-related work this week', type: 'decimal', note: 'Always reflects real effort — never zero when working' },
    { key: 'outreachContactsMade', label: 'Outreach contacts made this week', type: 'integer', note: 'Sponsors, venues, schools, community partners' },
    { key: 'promoMaterialsCreated', label: 'Promo/marketing pieces published or drafted this week', type: 'integer', note: '' },
    { key: 'totalConfirmedRegistrations', label: 'Total confirmed registrations for next event so far', type: 'integer', note: 'Builds up steadily in the lead-up to each event' },
    { key: 'totalAttendeesYTD', label: 'Total attendees YTD (cumulative)', type: 'integer', note: 'Include this event if one occurred — only goes up' },
    { key: 'attendeeSatisfactionScore', label: 'Post-event satisfaction score (out of 5)', type: 'decimal', badge: 'EVENT-TRIGGERED', note: 'Enter 0 in non-event weeks' },
    { key: 'repeatAttendeePercentage', label: 'Repeat attendee percentage (%)', type: 'decimal', badge: 'EVENT-TRIGGERED', note: 'Enter 0 in non-event weeks' },
    { key: 'postEventActionsPercent', label: '% of post-event actions completed', type: 'integer', badge: 'EVENT-TRIGGERED', note: 'Follow-ups sent, photos posted, feedback collected; enter 0 in non-event weeks' }
  ]
};

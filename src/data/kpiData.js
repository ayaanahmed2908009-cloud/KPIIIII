export const TEAM_COLORS = {
  marketing: '#3B82F6',
  sponsorships: '#10B981',
  generalManagement: '#8B5CF6',
  impactLabs: '#F59E0B',
  events: '#EF4444'
};

export const TEAM_LABELS = {
  marketing: 'Marketing & Social Media',
  sponsorships: 'Sponsorships & Fundraising',
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
        description: 'Ratio of standard posts to video posts, targeting a 2:1 mix in Year 1.',
        targets: { year1: '2:1', year2: '1:1', year3: '1:2' },
        feedingFields: ['Posts published this week', 'Videos published this week'],
        probabilityCalc: 'Calculates the cumulative YTD ratio of posts to videos and scores probability based on how close the ratio is to 2:1.',
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
  sponsorships: {
    label: 'Sponsorships & Fundraising',
    color: '#10B981',
    kpis: [
      {
        id: 'activePartners',
        name: 'Active Institutional Partners',
        description: 'Number of institutional organisations with a formalised, active partnership with SolarPak.',
        targets: { year1: '1', year2: '3', year3: '6' },
        feedingFields: ['Total active partners right now', 'New partnerships formalised this week'],
        probabilityCalc: 'Checks whether at least 1 active partner has been confirmed and projects pipeline conversion rates toward securing additional partners.',
        frequency: 'Weekly'
      },
      {
        id: 'conversionRate',
        name: 'Outreach Meeting Conversion Rate',
        description: 'Percentage of outreach meetings held that result in a formalised partnership.',
        targets: { year1: '20%', year2: '30%', year3: '35%' },
        feedingFields: ['Outreach meetings held this week', 'New partnerships formalised this week'],
        probabilityCalc: 'Divides cumulative partnerships formalised by total outreach meetings held YTD and assesses the probability of reaching 20%.',
        frequency: 'Weekly'
      },
      {
        id: 'totalFundraising',
        name: 'Total Fundraising Per Year',
        description: 'Total funds raised or committed by institutional partners and fundraising activities in the year.',
        targets: { year1: '$10,000', year2: '$20,000', year3: '$40,000' },
        feedingFields: ['Total funds raised YTD in USD', 'Funds raised or committed this week in USD'],
        probabilityCalc: 'Projects total YTD funds raised toward $10,000 using the current weekly average fundraising rate.',
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
        feedingFields: ['Events completed YTD', 'Hours spent on event planning this week', 'Is an event live or within 2 weeks'],
        probabilityCalc: 'Projects events completed YTD toward 3 using the current completion rate, boosted if active planning hours indicate an imminent event.',
        frequency: 'Weekly'
      },
      {
        id: 'totalAttendees',
        name: 'Total Event Attendees',
        description: 'Cumulative count of attendees across all events held during the year.',
        targets: { year1: '300', year2: '1,000', year3: '3,000' },
        feedingFields: ['Total confirmed attendees YTD', 'New registrations confirmed this week'],
        probabilityCalc: 'Projects total confirmed attendees YTD toward 300 using current registration pace.',
        frequency: 'Weekly'
      },
      {
        id: 'avgAttendeesPerEvent',
        name: 'Avg Attendees Per Event',
        description: 'Average number of attendees across all completed events in the year.',
        targets: { year1: '100', year2: '140', year3: '200' },
        feedingFields: ['Total attendees at the closed event (EVENT-TRIGGERED)', 'Events completed YTD'],
        probabilityCalc: 'Calculates the running average of attendees per completed event and assesses the probability of reaching 100 on average.',
        frequency: 'Event-triggered'
      },
      {
        id: 'eventSatisfaction',
        name: 'Post-Event Satisfaction Score',
        description: 'Average satisfaction score (out of 5) from post-event surveys completed by attendees.',
        targets: { year1: '4.0/5', year2: '4.3/5', year3: '4.5/5' },
        feedingFields: ['Post-event satisfaction score for any event that closed this week (EVENT-TRIGGERED)'],
        probabilityCalc: 'Averages all non-zero event satisfaction scores submitted and estimates the probability of sustaining ≥4.0/5.',
        frequency: 'Event-triggered'
      },
      {
        id: 'repeatAttendeeRate',
        name: 'Repeat Attendee Rate',
        description: 'Percentage of event attendees who have attended a previous SolarPak event.',
        targets: { year1: '15%', year2: '25%', year3: '35%' },
        feedingFields: ['Repeat attendees at the closed event (EVENT-TRIGGERED)', 'Total attendees at the closed event (EVENT-TRIGGERED)'],
        probabilityCalc: 'Calculates the cumulative repeat attendee rate across all completed events and projects toward the 15% annual target.',
        frequency: 'Event-triggered'
      },
      {
        id: 'eventsWithSponsor',
        name: 'Events with a Confirmed Sponsor',
        description: 'Number of events that have at least one confirmed external sponsor or partner.',
        targets: { year1: '1', year2: '4', year3: '10' },
        feedingFields: ['Events with a confirmed sponsor YTD', 'Sponsor or partner conversations held this week'],
        probabilityCalc: 'Projects events with a confirmed sponsor YTD toward 1, boosted by active sponsor pipeline conversations.',
        frequency: 'Weekly'
      }
    ]
  }
};

export const TEAM_KEYS = ['marketing', 'sponsorships', 'generalManagement', 'impactLabs', 'events'];

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
  sponsorships: {
    outreachMeetingsHeld: 0,
    prospectsOutreachStage: 0,
    prospectsMeetingStage: 0,
    newPartnershipsFormalised: 0,
    totalActivePartners: 0,
    fundsRaisedThisWeek: 0,
    totalFundsRaisedYTD: 0
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
    annualReportPercentComplete: 0
  },
  events: {
    hoursEventPlanning: 0,
    eventLiveOrWithin2Weeks: 0,
    eventsCompletedYTD: 0,
    newRegistrationsConfirmed: 0,
    totalConfirmedAttendeesYTD: 0,
    sponsorConversationsHeld: 0,
    eventsWithConfirmedSponsorYTD: 0,
    postEventSatisfactionScore: 0,
    repeatAttendeesClosedEvent: 0,
    totalAttendeesClosedEvent: 0
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
  sponsorships: [
    { key: 'outreachMeetingsHeld', label: 'Outreach meetings held this week', type: 'integer', note: '' },
    { key: 'prospectsOutreachStage', label: 'Prospects currently in outreach stage', type: 'integer', note: 'Infographic only' },
    { key: 'prospectsMeetingStage', label: 'Prospects currently in meeting stage', type: 'integer', note: 'Infographic only' },
    { key: 'newPartnershipsFormalised', label: 'New partnerships formalised this week', type: 'integer', note: '' },
    { key: 'totalActivePartners', label: 'Total active partners right now', type: 'integer', note: 'Current absolute count' },
    { key: 'fundsRaisedThisWeek', label: 'Funds raised or committed this week (USD)', type: 'integer', note: '' },
    { key: 'totalFundsRaisedYTD', label: 'Total funds raised YTD (USD)', type: 'integer', note: 'Current absolute count' }
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
    { key: 'annualReportPercentComplete', label: 'Annual impact report % complete', type: 'integer', note: 'Enter 0 in non-update weeks; update monthly' }
  ],
  events: [
    { key: 'hoursEventPlanning', label: 'Hours spent on event planning this week', type: 'decimal', note: 'e.g. 4.5' },
    { key: 'eventLiveOrWithin2Weeks', label: 'Is an event live or within 2 weeks?', type: 'binary', note: '1 = yes, 0 = no' },
    { key: 'eventsCompletedYTD', label: 'Events completed YTD', type: 'integer', note: 'Current absolute count' },
    { key: 'newRegistrationsConfirmed', label: 'New registrations confirmed this week', type: 'integer', note: '' },
    { key: 'totalConfirmedAttendeesYTD', label: 'Total confirmed attendees YTD', type: 'integer', note: 'Current absolute count' },
    { key: 'sponsorConversationsHeld', label: 'Sponsor or partner conversations held this week', type: 'integer', note: '' },
    { key: 'eventsWithConfirmedSponsorYTD', label: 'Events with a confirmed sponsor YTD', type: 'integer', note: 'Current absolute count' },
    { key: 'postEventSatisfactionScore', label: 'Post-event satisfaction score (out of 5)', type: 'decimal', badge: 'EVENT-TRIGGERED', note: 'Enter 0 if no event closed' },
    { key: 'repeatAttendeesClosedEvent', label: 'Repeat attendees at the closed event', type: 'integer', badge: 'EVENT-TRIGGERED', note: 'Enter 0 if no event closed' },
    { key: 'totalAttendeesClosedEvent', label: 'Total attendees at the closed event', type: 'integer', badge: 'EVENT-TRIGGERED', note: 'Enter 0 if no event closed' }
  ]
};

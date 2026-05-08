// Load .env manually so existing empty env vars get overridden
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    // Only set if not already provided by the environment (Railway vars take priority)
    if (!process.env[key]) process.env[key] = value;
  });
}
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Persistent JSON data store ───────────────────────────────────────────────
// DATA_DIR env var lets you point this at a Railway persistent volume (/data).
// Without a volume the file lives next to server.js and is lost on redeploy,
// but all users still share the same data while the server is running.
const DATA_DIR  = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'kpi-data.json');

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { history: [], analyses: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { history: [], analyses: [] };
  }
}

function writeData(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    // Write to a temp file then rename for atomicity
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, DATA_FILE);
  } catch (err) {
    console.error('[data] Write error:', err);
  }
}

// GET /api/history — return all weekly input entries
app.get('/api/history', (req, res) => {
  const data = readData();
  res.json({ history: data.history });
});

// POST /api/history — upsert a single weekly entry (replaces same team+week)
app.post('/api/history', (req, res) => {
  const entry = req.body;
  if (!entry || !entry.team || entry.weekNumber === undefined) {
    return res.status(400).json({ error: 'Invalid entry' });
  }
  const data = readData();
  data.history = data.history.filter(
    e => !(e.team === entry.team && e.weekNumber === entry.weekNumber)
  );
  data.history.push(entry);
  writeData(data);
  res.json({ success: true });
});

// DELETE /api/history — clear all weekly entries
app.delete('/api/history', (req, res) => {
  const data = readData();
  data.history = [];
  writeData(data);
  res.json({ success: true });
});

// DELETE /api/history/week/:weekNumber — clear all entries for a specific week
app.delete('/api/history/week/:weekNumber', (req, res) => {
  const weekNum = parseInt(req.params.weekNumber, 10);
  if (isNaN(weekNum)) return res.status(400).json({ error: 'Invalid week number' });
  const data = readData();
  data.history = data.history.filter(e => e.weekNumber !== weekNum);
  writeData(data);
  res.json({ success: true });
});

// DELETE /api/history/team/:teamKey — clear all entries for a specific team
app.delete('/api/history/team/:teamKey', (req, res) => {
  const teamKey = req.params.teamKey;
  const data = readData();
  data.history = data.history.filter(e => e.team !== teamKey);
  writeData(data);
  res.json({ success: true });
});

// GET /api/analysis — return all analysis history entries
app.get('/api/analysis', (req, res) => {
  const data = readData();
  res.json({ analyses: data.analyses });
});

// POST /api/analysis — append a new analysis entry
app.post('/api/analysis', (req, res) => {
  const entry = req.body;
  if (!entry || !entry.weekNumber || !entry.analysis) {
    return res.status(400).json({ error: 'Invalid entry' });
  }
  const data = readData();
  data.analyses.push(entry);
  writeData(data);
  res.json({ success: true });
});

// DELETE /api/analysis — clear all analysis entries
app.delete('/api/analysis', (req, res) => {
  const data = readData();
  data.analyses = [];
  writeData(data);
  res.json({ success: true });
});

// Lazy-init so missing key doesn't crash the server on startup
let anthropic = null;
function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropic) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic;
}

const YEAR1_TARGETS = {
  marketing: {
    totalFollowers: 3000,
    engagementRate: '2-4%',
    postsPerMonth: 12,
    postVideoRatio: '1:2',
    pressMentions: 4
  },
  generalManagement: {
    activeMembers: 22,
    retentionRate: '80%',
    okrCompletionRate: '70%',
    probabilityAchievementScore: '>70%',
    workerSatisfaction: '>=90%'
  },
  impactLabs: {
    annualReportPublished: 1,
    annualReportDeadline: '20 May 2026 (FY Week 8) — HARD DEADLINE, not end of year',
    articlesPublished: 8,
    dataAccuracyAuditScore: '85%',
    reportQualityAIScore: '>85',
    externalCitations: 2
  },
  businessDevelopment: {
    annualRevenue: '$7,000 USD',
    activeSalesChannels: 2,
    repeatCustomers: 10,
    customerAcquisitionCost: 'CAC tracked and understood (no specific number target — consistency of tracking is the goal)',
    customerSatisfaction: 'Positive customer feedback collected — rolling average > 3.5/5',
    distributionPartnerships: 'Pipeline established — at least 2 active leads by year end'
  },
  events: {
    eventsOrganised: 3,
    eventPipelineHealth: 'consistent weekly planning progress (planning % rising week-on-week, milestones being confirmed)',
    weeklyEngagementActivity: '>=5 planning hours/week average, >=3 outreach contacts/week average',
    totalAttendees: 300,
    postEventQuality: 'satisfaction >=4.0/5, repeat attendee rate >=15%, post-event follow-through >=80%'
  }
};

const FY_START = new Date('2026-04-01T00:00:00Z'); // April 1 2026
const FY_END   = new Date('2027-03-31T23:59:59Z'); // March 31 2027
const TOTAL_WEEKS = 52;

function getFYContext(weekNumber) {
  const weeksRemaining = Math.max(0, TOTAL_WEEKS - weekNumber);
  const pctElapsed = ((weekNumber / TOTAL_WEEKS) * 100).toFixed(1);
  const pctRemaining = (100 - parseFloat(pctElapsed)).toFixed(1);

  // Compute calendar date range for the given week
  const weekStart = new Date(FY_START.getTime() + (weekNumber - 1) * 7 * 24 * 3600 * 1000);
  const weekEnd   = new Date(weekStart.getTime() + 6 * 24 * 3600 * 1000);
  const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return {
    weeksRemaining,
    pctElapsed,
    pctRemaining,
    weekDateRange: `${fmt(weekStart)} – ${fmt(weekEnd)}`,
    fyLabel: 'FY 2026–27 (1 Apr 2026 – 31 Mar 2027)',
  };
}

function buildPrompt(weekNumber, history) {
  const historyStr = JSON.stringify(history, null, 2);
  const targetsStr = JSON.stringify(YEAR1_TARGETS, null, 2);
  const { weeksRemaining, pctElapsed, pctRemaining, weekDateRange, fyLabel } = getFYContext(weekNumber);

  return `You are a KPI performance analyst for SolarPak, a growing solar energy nonprofit.

FISCAL YEAR: ${fyLabel}
CURRENT WEEK: ${weekNumber} of ${TOTAL_WEEKS}  (${weekDateRange})
WEEKS ELAPSED: ${weekNumber}  |  WEEKS REMAINING: ${weeksRemaining}  |  YEAR PROGRESS: ${pctElapsed}% elapsed, ${pctRemaining}% remaining

YOUR PRIMARY TASK — TREND-BASED CONTINUOUS ASSESSMENT:
You must NOT assess only the latest week in isolation. You must:
1. Read ALL weeks of history for each team (including trial weeks with negative week numbers).
2. Calculate the week-over-week DELTA for every key metric (e.g. follower growth, funds raised, articles published).
3. Determine the TREND DIRECTION: accelerating, decelerating, flat, or volatile.
4. Project that trend forward over ${weeksRemaining} remaining weeks to estimate end-of-year outcome.
5. Compare the projected outcome to the annual target to derive the probability.

TREND ANALYSIS RULES:
- A single week of data → low_confidence = true, probability should be 55–70 (assume early optimism, plenty of time to improve).
- 2–3 weeks: look for direction. Improving → 60–75. Flat → 55–65. Declining → 45–60. Still set low_confidence = true.
- 4+ weeks: trends are meaningful. Weight the most recent 3 weeks 2× vs earlier weeks (recency bias).
- If the latest week is significantly better than the prior average → reward with a probability bump of 5–10 points.
- If worse → penalise by no more than 5–8 points (teams recover; one bad week is not a death sentence).
- For cumulative metrics (YTD totals, funds raised): compute average weekly increment across all weeks, project remaining weeks, compare to gap vs target.
- For rate metrics (engagement %, retention %, satisfaction score): compute rolling average across all available weeks. Compare to target band.
- Never give below 25% unless a target is mathematically impossible given weeks remaining.
- Never give above 95% unless the target is already met or mathematically guaranteed.

PROBABILITY CALIBRATION BY YEAR STAGE — BE GENEROUS, ESPECIALLY EARLY:
- Pre-FY / trial weeks (week ≤ 0): These are warm-up weeks. Treat any activity as a positive signal. Base probability 60–75.
- Early year (weeks 1–12): ${weeksRemaining} weeks of recovery time remain. Default to optimistic range 55–80 unless trend is clearly catastrophic. A team behind by 20% in week 4 still has a 70%+ chance of recovery.
- Mid year (weeks 13–36): Trend lines are becoming reliable. Weight momentum heavily but maintain a floor of 35%.
- Late year (weeks 37–52): Extrapolate from cumulative actuals. Probabilities tighten. Floor is 15%.
- Missing team data this week: use last known inputs, do not penalise, flag low_confidence = true.
- IMPORTANT: SolarPak is a new nonprofit. Be encouraging but honest. Err on the side of achievable rather than harsh.

IMPACT LABS — ANNUAL REPORT SPECIAL ASSESSMENT RULES:
The annual impact report has a HARD INTERNAL DEADLINE of 20 May 2026 (FY Week 8) — NOT end of year.
- Do NOT project the report completion toward end of March 2027. The window closes at Week 8.
- If the current week is ≤ Week 8: calculate probability based on (100 - annualReportPercentComplete) remaining work vs weeks left until Week 8. If on pace to finish by Week 8, score high (75–90). If behind pace, penalise sharply.
- If the current week is > Week 8 and the report was not submitted as 100% complete by then: the Annual Impact Report KPI probability should be set very low (15–25) to reflect a missed hard deadline. Do not recover this score — the opportunity has passed.
- If the current week is > Week 8 and annualReportPercentComplete reached 100 at or before Week 8: set probability to 95.
- Weeks where annualReportPercentComplete = 0 and the team has NOT previously reported any progress: treat as not-yet-started, not as "entered 0 this week".

EVENTS TEAM — SPECIAL ASSESSMENT RULES (apply these every time you analyse the events team):
The events team KPI structure was updated mid-year. Older history entries (pre-update) used different field names. Apply these backward-compatibility rules:
- Old field "eventsHeldThisWeek > 0" is equivalent to new field "eventOccurredThisWeek = 1". Treat them the same way.
- Old fields "totalEventsYTD" and "totalAttendeesYTD" have the same key names in new entries — use them normally across all history.
- Old field "attendeeSatisfactionScore" and "repeatAttendeePercentage" have the same key names — use them normally.
- Old fields "eventsHeldThisWeek", "attendeesThisWeek", "volunteersEngaged", "schoolsReachedYTD" exist only in old entries. Do not penalise their absence in new entries.
- New fields "nextEventPlanningPercent", "milestonesConfirmedThisWeek", "eventPlanningHoursThisWeek", "outreachContactsMade", "promoMaterialsCreated", "totalConfirmedRegistrations", "postEventActionsPercent" exist only in new entries. Do not penalise their absence in old entries.

EVENT-TRIGGERED KPI SCORING (critical — do not apply standard trend logic here):
- "Post-Event Quality Score" must ONLY be scored using weeks where eventOccurredThisWeek = 1 (or eventsHeldThisWeek > 0 in old entries).
- Weeks with no event are NOT zero scores — they are SKIPPED ENTIRELY. A team with 40 non-event weeks and 2 excellent event weeks should score HIGH on post-event quality, not low.
- If no events have occurred yet, set Post-Event Quality Score probability to 65 (neutral/early — do not penalise).

PIPELINE & EFFORT KPIs (use these to credit ongoing work between events):
- "Event Pipeline & Planning Health": Score based on whether nextEventPlanningPercent is increasing week-over-week and milestones are being confirmed. Flat or rising = positive. Zero every week = at risk.
- "Weekly Engagement Activity": Score based on average weekly eventPlanningHoursThisWeek and outreachContactsMade. A team consistently putting in ≥5 hours/week and making ≥3 outreach contacts is on track even if no events have occurred yet.
- These two KPIs ensure the events team is NEVER penalised simply for being in a non-event period. They reflect real work being done toward future events.

YEAR 1 ANNUAL KPI TARGETS:
${targetsStr}

COMPLETE WEEKLY INPUT HISTORY — ${history.length} entries, chronological (oldest first, most recent last):
${historyStr}

For each KPI across all four teams, calculate the probability (0–100%) that the team will hit that KPI's annual target by end of year. Base this on the FULL TREND across all weeks — not just the latest entry.

If fewer than 4 weeks of real FY data exist (week number ≥ 1), set low_confidence to true.

BUSINESS DEVELOPMENT TEAM — SPECIAL ASSESSMENT RULES:
This team uses e-commerce to generate revenue (Shopify, Etsy, Instagram Shop, local markets, wholesale, etc.).
- Revenue is cumulative — project totalRevenueYTD forward using average weekly revenueThisWeek pace.
- CAC KPI: score is based on TRACKING CONSISTENCY, not the actual CAC value. If both marketingSpendThisWeek and newCustomersThisWeek are submitted (non-zero) in most weeks, score high (75–90). If one or both are missing regularly, score low. CAC = marketingSpendThisWeek / newCustomersThisWeek — compute and mention it.
- Repeat customers: cumulative metric — repeatCustomersTotal only goes up. Project toward 10.
- Customer satisfaction: skip weeks where satisfactionResponses = 0. Only average weeks with real feedback. A team with 3 good feedback weeks is scored well even if many weeks have no responses.
- Distribution partnerships: partnershipsSignedTotal is cumulative. partnershipLeads is a leading indicator. For Year 1, a pipeline of 2+ active leads counts as on track even with 0 signed.
- Active channels: reward increases. 0 channels = critical. 1 = at risk. 2+ = on track.

TEAM ADVICE RULES (for teamAdvice field):
- Write 3–5 bullet points addressed directly to the team lead ("you", "your team").
- Each point must reference actual numbers from their data — no generic advice.
- Focus on the highest-leverage action they can take in the next 1–2 weeks.
- Be direct and specific: e.g. "Your follower growth averages 8/week — you need 35/week to hit 3,000. Prioritise video output and cross-posting."
- Keep each bullet under 35 words.

Return ONLY this JSON structure, no preamble, no markdown fences:

{
  "marketing": {
    "overallProbability": <integer 0-100>,
    "low_confidence": <boolean>,
    "diagnosis": "<2-3 sentences: overall trajectory, what drags probability down, one specific action to improve>",
    "teamAdvice": ["<action #1 with real numbers>", "<action #2>", "<action #3>"],
    "kpis": [
      {"name": "Total Social Following", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Avg Engagement Rate", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Posts Per Month", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Post to Video Ratio", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Press Mentions Per Year", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"}
    ]
  },
  "generalManagement": {
    "overallProbability": <integer 0-100>,
    "low_confidence": <boolean>,
    "diagnosis": "<2-3 sentences>",
    "teamAdvice": ["<action #1 with real numbers>", "<action #2>", "<action #3>"],
    "kpis": [
      {"name": "Active Team Members", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Member Retention Rate", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "OKR Completion Rate", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Probability Achievement Score", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Worker Satisfaction", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"}
    ]
  },
  "impactLabs": {
    "overallProbability": <integer 0-100>,
    "low_confidence": <boolean>,
    "diagnosis": "<2-3 sentences>",
    "teamAdvice": ["<action #1 with real numbers>", "<action #2>", "<action #3>"],
    "kpis": [
      {"name": "Annual Impact Report", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Research Articles Published", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Data Accuracy Audit Score", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Report Quality AI Score", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "External Citations", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"}
    ]
  },
  "events": {
    "overallProbability": <integer 0-100>,
    "low_confidence": <boolean>,
    "diagnosis": "<2-3 sentences>",
    "teamAdvice": ["<action #1 with real numbers>", "<action #2>", "<action #3>"],
    "kpis": [
      {"name": "Events Organised", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Event Pipeline & Planning Health", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Weekly Engagement Activity", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Total Event Attendees", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Post-Event Quality Score", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"}
    ]
  },
  "businessDevelopment": {
    "overallProbability": <integer 0-100>,
    "low_confidence": <boolean>,
    "diagnosis": "<2-3 sentences: revenue trajectory, biggest gap vs target, one action>",
    "teamAdvice": ["<action #1 with real numbers — e.g. revenue pace, CAC figure, repeat customer gap>", "<action #2>", "<action #3>"],
    "kpis": [
      {"name": "Annual Revenue", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence including projected year-end figure>"},
      {"name": "Active Sales Channels", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Repeat Customer Base", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence including current count vs target 10>"},
      {"name": "Customer Acquisition Cost", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence — mention actual CAC if calculable, and tracking consistency>"},
      {"name": "Customer Satisfaction", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence — mention average score if data exists>"},
      {"name": "Distribution Partnerships", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence — mention signed count and pipeline>"}
    ]
  }
}`;
}

app.post('/api/analyze', async (req, res) => {
  try {
    // Accept API key from request body (sent by client from localStorage) or fall back to env var
    const { weekNumber, history, apiKey: bodyKey } = req.body;
    const resolvedKey = bodyKey || process.env.ANTHROPIC_API_KEY;
    console.log('[analyze] KEY source:', bodyKey ? 'request body' : 'env var', '| KEY present:', !!resolvedKey);

    if (!resolvedKey) {
      return res.status(500).json({ success: false, error: 'ANTHROPIC_API_KEY not configured.' });
    }

    // Build a fresh client with the resolved key
    const client = new Anthropic({ apiKey: resolvedKey });
    console.log('[analyze] weekNumber:', weekNumber, '| history entries:', history?.length);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: 'You are a KPI performance analyst. Return only valid JSON with no preamble, no markdown fences, and no extra text. Analyse ALL weeks of history to identify trends before calculating probabilities. Keep each rationale under 25 words and each diagnosis under 50 words.',
      messages: [{ role: 'user', content: buildPrompt(weekNumber, history) }]
    });

    const raw = message.content[0].text.trim();

    // Strip markdown fences if present
    let cleaned = raw;
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    // Extract the first complete JSON object if there's surrounding text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found in Claude response');
    cleaned = jsonMatch[0];

    const result = JSON.parse(cleaned);
    res.json({ success: true, analysis: result });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Serve React build — API routes above take priority
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(200).send('SolarPak API running. Build folder not found — run npm run build first.');
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SolarPak API server running on port ${PORT}`);
  console.log(`[startup] ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'SET ✓ (prefix: ' + process.env.ANTHROPIC_API_KEY.slice(0, 16) + ')' : 'MISSING ✗'}`);
});

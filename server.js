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
    postVideoRatio: '2:1',
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
    articlesPublished: 8,
    dataAccuracyAuditScore: '85%',
    reportQualityAIScore: '>85',
    externalCitations: 2
  },
  events: {
    eventsOrganised: 3,
    totalAttendees: 300,
    avgAttendeesPerEvent: 100,
    postEventSatisfaction: '4.0/5',
    repeatAttendeeRate: '15%',
    eventsWithSponsor: 1
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

YEAR 1 ANNUAL KPI TARGETS:
${targetsStr}

COMPLETE WEEKLY INPUT HISTORY — ${history.length} entries, chronological (oldest first, most recent last):
${historyStr}

For each KPI across all four teams, calculate the probability (0–100%) that the team will hit that KPI's annual target by end of year. Base this on the FULL TREND across all weeks — not just the latest entry.

If fewer than 4 weeks of real FY data exist (week number ≥ 1), set low_confidence to true.

Return ONLY this JSON structure, no preamble, no markdown fences:

{
  "marketing": {
    "overallProbability": <integer 0-100>,
    "low_confidence": <boolean>,
    "diagnosis": "<2-3 sentences: overall trajectory, what drags probability down, one specific action to improve>",
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
    "kpis": [
      {"name": "Events Organised", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Total Event Attendees", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Avg Attendees Per Event", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Post-Event Satisfaction", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Repeat Attendee Rate", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Events with Confirmed Sponsor", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"}
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
      max_tokens: 6000,
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

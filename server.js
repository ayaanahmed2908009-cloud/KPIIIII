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
    process.env[key] = value;
  });
}
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
  sponsorships: {
    activePartners: 1,
    conversionRate: '20%',
    totalFundraising: 10000
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

PROBABILITY CALIBRATION RULES (apply to every KPI):
1. Time-sensitivity: If a team is behind pace but has ${weeksRemaining} weeks left, the probability should reflect the realistic chance of recovery — not just current pace extrapolation. A team 20% behind in week 4 with 48 weeks remaining has a much higher recovery probability than one 20% behind in week 48 with 4 weeks left.
2. Early year (weeks 1–12): Widen confidence intervals. Low data = genuine uncertainty in both directions. Avoid extreme probabilities unless trajectory is clearly catastrophic or clearly ahead.
3. Mid year (weeks 13–36): Trend lines are becoming reliable. Weight recent acceleration/deceleration heavily.
4. Late year (weeks 37–52): Extrapolate from actual cumulative numbers. Very little variance possible. Probabilities should tighten toward 0 or 100 unless targets are borderline.
5. Missing team data: If no inputs were submitted for a team this week, use the most recent available inputs to assess trajectory. Flag low_confidence = true.
6. Pace formula: For cumulative targets, probability = f(current_pace × weeks_remaining vs. gap_to_target). For rate-based targets (e.g. engagement rate, retention), probability = f(average over available weeks vs. target band).

YEAR 1 ANNUAL KPI TARGETS:
${targetsStr}

COMPLETE WEEKLY INPUT HISTORY — ${history.length} entries, most recent last:
${historyStr}

For each KPI across all five teams, calculate the probability (0–100%) that the team will hit that KPI's annual target by the end of the year, based on current pace and trajectory.

If fewer than 4 weeks of data exist, set low_confidence to true and caveat estimates.

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
  "sponsorships": {
    "overallProbability": <integer 0-100>,
    "low_confidence": <boolean>,
    "diagnosis": "<2-3 sentences>",
    "kpis": [
      {"name": "Active Institutional Partners", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Outreach Conversion Rate", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"},
      {"name": "Total Fundraising", "probability": <int>, "riskFlag": "<on track|at risk|critical>", "rationale": "<one sentence>"}
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
    const client = getAnthropic();
    if (!client) {
      return res.status(500).json({ success: false, error: 'ANTHROPIC_API_KEY not configured.' });
    }

    const { weekNumber, history } = req.body;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: 'You are a KPI performance analyst. Return only valid JSON with no preamble, no markdown fences, and no extra text. Be concise — keep each rationale under 20 words and each diagnosis under 40 words.',
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

// Always serve the React build (API routes above take priority)
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`SolarPak API server running on port ${PORT}`));

// ─── User credentials and role definitions ────────────────────────────────────
// To change a password, edit the `password` field here.
// Credentials are stored in sessionStorage — they clear when the browser is closed.

export const USERS = [
  {
    username: 'ceo',
    password: 'solar2026',
    role: 'ceo',
    label: 'CEO',
    team: null   // CEO has no single team — sees everything
  },
  {
    username: 'general',
    password: 'manage2026',
    role: 'generalManagement',
    label: 'General Management',
    team: 'generalManagement'
  },
  {
    username: 'marketing',
    password: 'market2026',
    role: 'marketing',
    label: 'Marketing & Social Media',
    team: 'marketing'
  },
  {
    username: 'sponsorships',
    password: 'sponsor2026',
    role: 'sponsorships',
    label: 'Sponsorships & Fundraising',
    team: 'sponsorships'
  },
  {
    username: 'impactlabs',
    password: 'impact2026',
    role: 'impactLabs',
    label: 'Impact Labs',
    team: 'impactLabs'
  },
  {
    username: 'events',
    password: 'events2026',
    role: 'events',
    label: 'Events & Community Outreach',
    team: 'events'
  }
];

export function authenticate(username, password) {
  return USERS.find(
    u => u.username === username.toLowerCase().trim() && u.password === password
  ) || null;
}

// Full visibility: CEO and General Management see all teams
export function canSeeAll(role) {
  return role === 'ceo' || role === 'generalManagement';
}

// Only CEO and General Management can trigger AI analysis
export function canRunAnalysis(role) {
  return role === 'ceo' || role === 'generalManagement';
}

// Returns the array of team keys visible to this role
export function getVisibleTeams(role) {
  if (canSeeAll(role)) return ['marketing', 'sponsorships', 'generalManagement', 'impactLabs', 'events'];
  // Team lead sees only their own team
  return [role];
}

// Session persistence
const SESSION_KEY = 'solarpak_session';

export function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    username: user.username,
    role: user.role,
    label: user.label,
    team: user.team
  }));
}

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

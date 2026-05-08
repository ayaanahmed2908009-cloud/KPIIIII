// ─── User credentials and role definitions ────────────────────────────────────
// To change a password, edit the `password` field here.
// Credentials are stored in sessionStorage — they clear when the browser is closed.

export const USERS = [
  {
    username: 'ceo',
    password: 'Px4Nk9Wm',
    role: 'ceo',
    label: 'CEO',
    team: null   // CEO has no single team — sees everything
  },
  {
    username: 'general',
    password: 'Bz7Rq2Xv',
    role: 'generalManagement',
    label: 'General Management',
    team: 'generalManagement'
  },
  {
    username: 'marketing',
    password: 'Tj5Jv8Lf',
    role: 'marketing',
    label: 'Marketing & Social Media',
    team: 'marketing'
  },
  {
    username: 'impactlabs',
    password: 'Gn3Hc6Yw',
    role: 'impactLabs',
    label: 'Impact Labs',
    team: 'impactLabs'
  },
  {
    username: 'events',
    password: 'Kw9Mb4Fs',
    role: 'events',
    label: 'Events & Community Outreach',
    team: 'events'
  },
  {
    username: 'gm2',
    password: 'read',
    role: 'gm2',
    label: 'GM2 (Read Only)',
    team: null,
    readOnly: true
  },
  {
    username: 'bd',
    password: 'Vr6Dn2Qx',
    role: 'businessDevelopment',
    label: 'Business Development',
    team: 'businessDevelopment'
  }
];

export function authenticate(username, password) {
  return USERS.find(
    u => u.username === username.toLowerCase().trim() && u.password === password
  ) || null;
}

// Full visibility: CEO, General Management, and GM2 (read-only) see all teams
export function canSeeAll(role) {
  return role === 'ceo' || role === 'generalManagement' || role === 'gm2';
}

// Read-only accounts cannot submit or modify any data
export function isReadOnly(role) {
  return role === 'gm2';
}

// Only CEO and General Management can trigger AI analysis
export function canRunAnalysis(role) {
  return role === 'ceo' || role === 'generalManagement';
}

// Returns the array of team keys visible to this role
export function getVisibleTeams(role) {
  if (canSeeAll(role)) return ['marketing', 'generalManagement', 'impactLabs', 'events', 'businessDevelopment'];
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

const HISTORY_KEY = 'solarpak_kpi_history';
const ANALYSIS_KEY = 'solarpak_kpi_analysis';

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function loadAnalysisHistory() {
  try {
    const raw = localStorage.getItem(ANALYSIS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAnalysisHistory(analyses) {
  localStorage.setItem(ANALYSIS_KEY, JSON.stringify(analyses));
}

export function clearAll() {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(ANALYSIS_KEY);
}

export function exportHistory(history, analyses) {
  const payload = { weeklyInputHistory: history, analysisHistory: analyses, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'solarpak-kpi-history.json';
  a.click();
  URL.revokeObjectURL(url);
}

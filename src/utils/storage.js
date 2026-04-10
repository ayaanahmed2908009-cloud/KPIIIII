// ─── Server-backed storage ────────────────────────────────────────────────────
// All data is stored on the server (data/kpi-data.json) so every user on every
// device shares the same state. localStorage is no longer used for app data.

export async function loadHistory() {
  try {
    const res = await fetch('/api/history');
    if (!res.ok) return [];
    const data = await res.json();
    return data.history || [];
  } catch {
    return [];
  }
}

export async function saveEntry(entry) {
  try {
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  } catch (err) {
    console.error('[storage] Failed to save entry:', err);
  }
}

export async function loadAnalysisHistory() {
  try {
    const res = await fetch('/api/analysis');
    if (!res.ok) return [];
    const data = await res.json();
    return data.analyses || [];
  } catch {
    return [];
  }
}

export async function saveAnalysis(entry) {
  try {
    await fetch('/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  } catch (err) {
    console.error('[storage] Failed to save analysis:', err);
  }
}

export async function clearWeek(weekNumber) {
  try {
    await fetch(`/api/history/week/${weekNumber}`, { method: 'DELETE' });
  } catch (err) {
    console.error('[storage] Failed to clear week:', err);
  }
}

export async function clearAll() {
  try {
    await Promise.all([
      fetch('/api/history', { method: 'DELETE' }),
      fetch('/api/analysis', { method: 'DELETE' })
    ]);
  } catch (err) {
    console.error('[storage] Failed to clear data:', err);
  }
}

export function exportHistory(history, analyses) {
  const payload = {
    weeklyInputHistory: history,
    analysisHistory: analyses,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'solarpak-kpi-history.json';
  a.click();
  URL.revokeObjectURL(url);
}

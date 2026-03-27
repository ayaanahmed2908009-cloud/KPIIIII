import React, { useState, useCallback } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import RiskHeatmap from './pages/RiskHeatmap';
import KPIDirectory from './pages/KPIDirectory';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import AnalysisReport from './pages/AnalysisReport';
import { loadHistory, saveHistory, loadAnalysisHistory, saveAnalysisHistory } from './utils/storage';
import { getCurrentWeekNumber, getCurrentFYWeek, dateToFYWeek } from './utils/analysisHelpers';
import { loadSession, clearSession, canRunAnalysis, canSeeAll } from './auth/users';

function getDefaultPage(user) {
  if (!user) return 'dashboard';
  if (user.role === 'ceo' || user.role === 'generalManagement') return 'analytics';
  return 'dashboard';
}

function initHistory() {
  const saved = loadHistory();
  // Strip any leftover trial/seed entries (isTrial flag) — trial period is over
  const real = saved.filter(e => !e.isTrial);
  if (real.length !== saved.length) {
    saveHistory(real);
  }
  return real;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => loadSession());
  const [currentPage, setCurrentPage] = useState(() => getDefaultPage(loadSession()));
  const [history, setHistory] = useState(() => initHistory());
  const [analysisHistory, setAnalysisHistory] = useState(() => loadAnalysisHistory());
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [reportEntry, setReportEntry] = useState(null); // triggers briefing overlay
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('solarpak_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentPage(getDefaultPage(user));
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const handleAddEntry = useCallback((weekNumber, team, inputs) => {
    // Always tag the entry with the real FY week number derived from today's date
    const fyWeek = getCurrentFYWeek();
    const entry = {
      weekNumber: fyWeek,
      team,
      dateSubmitted: new Date().toISOString(),
      inputs
    };
    setHistory(prev => {
      // Replace any existing entry for the same team + week (prevents duplicates)
      const filtered = prev.filter(e => !(e.team === team && e.weekNumber === fyWeek));
      const next = [...filtered, entry];
      saveHistory(next);
      return next;
    });
  }, []);

  const handleRunAnalysis = useCallback(async () => {
    if (history.length === 0) return;
    setIsAnalysing(true);
    setAnalysisError(null);

    try {
      // Always use the real FY week so Claude knows exactly where we are in the year
      const weekNumber = getCurrentFYWeek();
      const storedKey = localStorage.getItem('solarpak_api_key') || '';
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekNumber, history, apiKey: storedKey })
      });
      const data = await response.json().catch(() => { throw new Error(`Server error: ${response.status}`); });
      if (!response.ok) throw new Error(data.error || `Server error: ${response.status}`);
      if (!data.success) throw new Error(data.error || 'Analysis failed');

      const entry = {
        weekNumber,
        dateRun: new Date().toISOString(),
        analysis: data.analysis
      };

      setAnalysisHistory(prev => {
        const next = [...prev, entry];
        saveAnalysisHistory(next);
        return next;
      });

      // Show the full briefing report immediately
      setReportEntry(entry);
    } catch (err) {
      setAnalysisError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalysing(false);
    }
  }, [history]);

  // Not logged in → show login screen
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Global error banner */}
      {analysisError && (
        <div style={{
          background: '#7f1d1d', border: '1px solid #ef4444',
          padding: '12px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span style={{ color: '#fecaca', fontSize: '13px', flex: 1 }}>
              <strong>Analysis error: </strong>{analysisError}
              {analysisError.includes('ANTHROPIC_API_KEY') && ' — enter your Anthropic API key below to fix this.'}
            </span>
            {analysisError.includes('ANTHROPIC_API_KEY') && (
              <button
                onClick={() => { setShowKeyInput(s => !s); setKeyDraft(apiKey); }}
                style={{ background: '#991b1b', border: '1px solid #ef4444', borderRadius: '6px', color: '#fecaca', fontSize: '12px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >🔑 Set API Key</button>
            )}
            <button
              onClick={() => { setAnalysisError(null); setShowKeyInput(false); }}
              style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '18px' }}
            >×</button>
          </div>
          {showKeyInput && analysisError.includes('ANTHROPIC_API_KEY') && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
              <input
                type="password"
                placeholder="sk-ant-api03-..."
                value={keyDraft}
                onChange={e => setKeyDraft(e.target.value)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '6px',
                  background: '#0f172a', border: '1px solid #ef4444',
                  color: '#f1f5f9', fontSize: '13px', fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => {
                  const trimmed = keyDraft.trim();
                  if (!trimmed) return;
                  localStorage.setItem('solarpak_api_key', trimmed);
                  setApiKey(trimmed);
                  setShowKeyInput(false);
                  setAnalysisError(null);
                  handleRunAnalysis();
                }}
                style={{
                  padding: '8px 18px', borderRadius: '6px', border: 'none',
                  background: '#ef4444', color: '#fff', fontSize: '13px',
                  fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Save & Retry</button>
            </div>
          )}
        </div>
      )}

      {currentPage === 'analytics' && (
        <Analytics
          history={history}
          analysisHistory={analysisHistory}
          currentUser={currentUser}
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard
          history={history}
          analysisHistory={analysisHistory}
          onAddEntry={handleAddEntry}
          onRunAnalysis={canRunAnalysis(currentUser.role) ? handleRunAnalysis : null}
          isAnalysing={isAnalysing}
          currentUser={currentUser}
        />
      )}
      {currentPage === 'heatmap' && (
        <RiskHeatmap analysisHistory={analysisHistory} currentUser={currentUser} />
      )}
      {currentPage === 'directory' && (
        <KPIDirectory currentUser={currentUser} />
      )}

      {/* Full-screen analysis briefing report */}
      {reportEntry && (
        <AnalysisReport
          analysisEntry={reportEntry}
          analysisHistory={[...analysisHistory]}
          onClose={() => setReportEntry(null)}
        />
      )}
    </div>
  );
}

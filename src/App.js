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
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekNumber, history })
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
          padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{ color: '#fecaca', fontSize: '13px' }}>
            <strong>Analysis error: </strong>{analysisError}
            {analysisError.includes('ANTHROPIC_API_KEY') && ' — add your key to the .env file and restart the server.'}
          </span>
          <button
            onClick={() => setAnalysisError(null)}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '18px' }}
          >×</button>
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

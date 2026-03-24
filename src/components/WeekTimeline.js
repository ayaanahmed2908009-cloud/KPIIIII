import React, { useState } from 'react';
import {
  FISCAL_LABEL, FISCAL_START,
  getCurrentFiscalWeek, getWeekShortLabel, getWeekFullLabel,
  getQuarterGroups, getSubmittedWeeks, getWeekEntries,
  isWeekPast, isWeekCurrent, isWeekFuture
} from '../utils/fiscalYear';
import { TEAM_COLORS, TEAM_LABELS } from '../data/kpiData';
import { getVisibleTeams, canSeeAll } from '../auth/users';
import WeekInputModal from './WeekInputModal';
import { TRIAL_WEEK_DATES } from '../data/seedData';

const QUARTER_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

function WeekTile({ weekNum, submitted, submittedTeams, totalTeams, isCurrentWeek, isPast, isFuture, teamColor, onClick }) {
  const [hovered, setHovered] = useState(false);

  let bg, border, textColor;
  if (isCurrentWeek) {
    bg = '#1e293b';
    border = '#F59E0B';
    textColor = '#F59E0B';
  } else if (submitted && totalTeams === 1) {
    // Single team view
    bg = teamColor + '25';
    border = teamColor;
    textColor = teamColor;
  } else if (submittedTeams > 0) {
    // Multi-team: partial or full
    const fullOpacity = submittedTeams / totalTeams;
    bg = `rgba(99,102,241,${0.1 + fullOpacity * 0.25})`;
    border = submittedTeams === totalTeams ? '#6366f1' : '#6366f1' + '80';
    textColor = submittedTeams === totalTeams ? '#a5b4fc' : '#818cf8';
  } else if (isPast) {
    bg = '#0f172a';
    border = '#1e293b';
    textColor = '#374151';
  } else {
    bg = '#0c1322';
    border = '#0f172a';
    textColor = '#1e293b';
  }

  const canClick = submitted || submittedTeams > 0 || isCurrentWeek;

  return (
    <div
      onClick={canClick ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={getWeekFullLabel(weekNum)}
      style={{
        background: hovered && canClick ? (bg === '#0c1322' ? '#1e293b' : bg) : bg,
        border: `1.5px solid ${hovered && canClick ? (isCurrentWeek ? '#F59E0B' : (border === '#0f172a' ? '#1e293b' : border)) : border}`,
        borderRadius: '6px',
        padding: '6px 4px',
        cursor: canClick ? 'pointer' : 'default',
        transition: 'all 0.12s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '52px',
        transform: hovered && canClick ? 'translateY(-1px)' : 'none',
        boxShadow: isCurrentWeek ? `0 0 0 2px #F59E0B30` : hovered && canClick ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div style={{ fontSize: '10px', fontWeight: '800', color: textColor }}>
        {weekNum}
      </div>
      <div style={{ fontSize: '8px', color: textColor, opacity: 0.7, textAlign: 'center', marginTop: '1px', lineHeight: '1.1' }}>
        {getWeekShortLabel(weekNum).split('–')[0]}
      </div>
      {/* Status indicators */}
      <div style={{ marginTop: '4px', display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {isCurrentWeek && (
          <span style={{ fontSize: '7px', background: '#F59E0B20', color: '#F59E0B', borderRadius: '3px', padding: '0 3px', fontWeight: '700' }}>
            NOW
          </span>
        )}
        {!isCurrentWeek && submittedTeams > 0 && totalTeams > 1 && (
          <span style={{ fontSize: '7px', color: textColor, opacity: 0.8 }}>
            {submittedTeams}/{totalTeams}
          </span>
        )}
        {!isCurrentWeek && submitted && totalTeams === 1 && (
          <span style={{ fontSize: '8px', color: teamColor }}>✓</span>
        )}
        {!isCurrentWeek && isPast && submittedTeams === 0 && !isCurrentWeek && (
          <span style={{ fontSize: '7px', color: '#1e293b' }}>✕</span>
        )}
      </div>
    </div>
  );
}

export default function WeekTimeline({ history, currentUser }) {
  const [selectedWeek, setSelectedWeek] = useState(null);

  const visibleTeams = getVisibleTeams(currentUser?.role);
  const seesAll = canSeeAll(currentUser?.role);
  const currentFiscalWeek = getCurrentFiscalWeek();
  const quarters = getQuarterGroups();

  // For single-team view, get the team color
  const teamColor = !seesAll ? TEAM_COLORS[currentUser?.role] : '#6366f1';

  // Build a set of submitted weeks per team
  const submittedByTeam = {};
  visibleTeams.forEach(t => {
    submittedByTeam[t] = getSubmittedWeeks(history, t);
  });

  // Get the week entries for the selected week (for the modal)
  const selectedEntries = selectedWeek ? getWeekEntries(history, selectedWeek) : [];

  // Stats
  const totalSubmitted = new Set(history.filter(e => visibleTeams.includes(e.team)).map(e => e.weekNumber)).size;
  const pastWeeks = currentFiscalWeek <= 0 ? 0 : Math.min(currentFiscalWeek - 1, 52);
  const completionRate = pastWeeks > 0 ? Math.round((totalSubmitted / pastWeeks) * 100) : 0;

  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: '14px',
      padding: '20px 24px', marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#f1f5f9' }}>
              📅 {FISCAL_LABEL} · Weekly Input History
            </span>
            {currentFiscalWeek === 0 && (
              <span style={{
                fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px',
                background: '#1c3553', color: '#60a5fa'
              }}>
                Starts Apr 1, 2026
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
            {currentFiscalWeek === 0
              ? `Fiscal year starts in ${Math.ceil((new Date('2026-04-01') - new Date()) / (1000*60*60*24))} days · Click any week to view submitted inputs`
              : `Week ${currentFiscalWeek} of 52 · Click any submitted week to view inputs · ${totalSubmitted} week${totalSubmitted !== 1 ? 's' : ''} with data`
            }
          </div>
        </div>

        {/* Stats chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {currentFiscalWeek > 0 && (
            <>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '6px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#f1f5f9' }}>
                  {currentFiscalWeek > 52 ? '52' : currentFiscalWeek}
                </div>
                <div style={{ fontSize: '9px', color: '#475569' }}>Current Wk</div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '6px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#34d399' }}>{totalSubmitted}</div>
                <div style={{ fontSize: '9px', color: '#475569' }}>Submitted</div>
              </div>
              {pastWeeks > 0 && (
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '6px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: completionRate >= 80 ? '#34d399' : completionRate >= 50 ? '#fbbf24' : '#f87171' }}>
                    {completionRate}%
                  </div>
                  <div style={{ fontSize: '9px', color: '#475569' }}>Fill rate</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {seesAll ? (
          <>
            <LegendItem color="#6366f1" label="All teams submitted" bg="#6366f125" />
            <LegendItem color="#6366f180" label="Partially submitted" bg="#6366f112" />
          </>
        ) : (
          <LegendItem color={teamColor} label="Submitted" bg={teamColor + '25'} />
        )}
        <LegendItem color="#F59E0B" label="Current week" bg="#1e293b" />
        <LegendItem color="#374151" label="Past · no data" bg="#0f172a" />
        <LegendItem color="#1e293b" label="Upcoming" bg="#0c1322" />
      </div>

      {/* Trial Period — pre-FY weeks -1 and 0 */}
      {(() => {
        const trialWeeks = [-1, 0];
        const hasAnyTrial = trialWeeks.some(w =>
          visibleTeams.some(t => history.some(e => e.team === t && e.weekNumber === w))
        );
        if (!hasAnyTrial) return null;
        return (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '10px', fontWeight: '700', color: '#60a5fa',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1d4ed820', border: '1px solid #3b82f6' }} />
              🧪 Pre-FY Trial Period · Mar 2026
              <span style={{ fontSize: '9px', background: '#1d4ed820', color: '#60a5fa', borderRadius: '4px', padding: '1px 6px', fontWeight: '600' }}>
                TRIAL DATA — Not counted in FY targets
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {trialWeeks.map(w => {
                const info = TRIAL_WEEK_DATES[String(w)];
                const submittedTeams = visibleTeams.filter(t =>
                  history.some(e => e.team === t && e.weekNumber === w)
                ).length;
                const hasData = submittedTeams > 0;
                return (
                  <div
                    key={w}
                    onClick={hasData ? () => setSelectedWeek(w) : undefined}
                    style={{
                      background: hasData ? '#1d4ed815' : '#0f172a',
                      border: `1.5px solid ${hasData ? '#3b82f6' : '#1e293b'}`,
                      borderRadius: '8px', padding: '8px 14px',
                      cursor: hasData ? 'pointer' : 'default',
                      minWidth: '120px',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: '800', color: hasData ? '#60a5fa' : '#334155' }}>
                      {info?.label}
                    </div>
                    <div style={{ fontSize: '9px', color: hasData ? '#3b82f6' : '#1e293b', marginTop: '2px' }}>
                      {info?.dates}
                    </div>
                    <div style={{ fontSize: '9px', color: hasData ? '#93c5fd' : '#334155', marginTop: '4px' }}>
                      {hasData
                        ? `${submittedTeams}/${visibleTeams.length} team${visibleTeams.length > 1 ? 's' : ''} ✓`
                        : 'No data'}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ height: '1px', background: '#1e293b', margin: '16px 0' }} />
          </div>
        );
      })()}

      {/* Quarter grids */}
      {quarters.map((q, qi) => (
        <div key={qi} style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '10px', fontWeight: '700', color: QUARTER_COLORS[qi],
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: QUARTER_COLORS[qi] + '40', border: `1px solid ${QUARTER_COLORS[qi]}` }} />
            {q.label}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(13, 1fr)',
            gap: '4px'
          }}>
            {q.weeks.map(weekNum => {
              const submittedTeams = visibleTeams.filter(t => submittedByTeam[t]?.has(weekNum)).length;
              const submitted = submittedTeams > 0;
              const isPast = isWeekPast(weekNum);
              const isCurrent = isWeekCurrent(weekNum);
              const isFuture = isWeekFuture(weekNum) && !isCurrent;

              return (
                <WeekTile
                  key={weekNum}
                  weekNum={weekNum}
                  submitted={submitted}
                  submittedTeams={submittedTeams}
                  totalTeams={visibleTeams.length}
                  isCurrentWeek={isCurrent}
                  isPast={isPast}
                  isFuture={isFuture}
                  teamColor={teamColor}
                  onClick={() => setSelectedWeek(weekNum)}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Team colour legend for multi-team view */}
      {seesAll && (
        <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {visibleTeams.map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#475569' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TEAM_COLORS[t] }} />
              {TEAM_LABELS[t].split(' ')[0]}
            </div>
          ))}
        </div>
      )}

      {/* Week detail modal */}
      {selectedWeek !== null && (
        <WeekInputModal
          weekNum={selectedWeek}
          entries={selectedEntries}
          currentUser={currentUser}
          onClose={() => setSelectedWeek(null)}
        />
      )}
    </div>
  );
}

function LegendItem({ color, label, bg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#475569' }}>
      <div style={{
        width: '16px', height: '16px', borderRadius: '3px',
        background: bg, border: `1.5px solid ${color}`, flexShrink: 0
      }} />
      {label}
    </div>
  );
}

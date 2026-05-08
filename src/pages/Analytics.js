import React, { useState } from 'react';
import { canSeeAll } from '../auth/users';
import { AIConfidenceBriefing } from '../components/charts/AIConfidenceBriefing';
import { FollowerGrowthChart, EngagementGaugeChart, ContentMixChart, PressFunnelChart, MomentumCard } from '../components/charts/MarketingCharts';
import { HeadcountChart, OKRHeatmapChart, RetentionDonutChart, SatisfactionChart, SelfVsAIChart } from '../components/charts/GeneralMgmtCharts';
import { ArticlePipelineChart, PublicationPaceChart, ReportQualityChart, AnnualReportProgress, ExternalReachChart, ResearchPartnershipChart } from '../components/charts/ImpactLabsCharts';
import { EventCalendarHeatmap, AttendeeTrackerChart, SatisfactionDotPlot, RepeatAttendeeGauge, SponsorVolunteerChart } from '../components/charts/EventsCharts';
import { RevenueTrajectoryChart, CustomerAcquisitionChart, CACChart, SatisfactionChannelsChart } from '../components/charts/BusinessDevelopmentCharts';

const TEAM_CONFIG = [
  {
    key: 'marketing',
    label: 'Marketing & Social Media',
    color: '#3B82F6',
    icon: '📣',
    charts: (history, analysisHistory) => [
      <FollowerGrowthChart key="1" history={history} />,
      <EngagementGaugeChart key="2" history={history} />,
      <ContentMixChart key="3" history={history} />,
      <PressFunnelChart key="4" history={history} />,
      <MomentumCard key="5" history={history} />,
    ],
  },
  {
    key: 'generalManagement',
    label: 'General Management',
    color: '#8B5CF6',
    icon: '🏛️',
    charts: (history, analysisHistory) => [
      <HeadcountChart key="1" history={history} />,
      <OKRHeatmapChart key="2" history={history} />,
      <RetentionDonutChart key="3" history={history} />,
      <SatisfactionChart key="4" history={history} />,
      <SelfVsAIChart key="5" history={history} analysisHistory={analysisHistory} />,
    ],
  },
  {
    key: 'impactLabs',
    label: 'Impact Labs',
    color: '#F59E0B',
    icon: '🔬',
    charts: (history, analysisHistory) => [
      <ArticlePipelineChart key="1" history={history} />,
      <PublicationPaceChart key="2" history={history} />,
      <ReportQualityChart key="3" history={history} />,
      <AnnualReportProgress key="4" history={history} />,
      <ExternalReachChart key="5" history={history} />,
      <ResearchPartnershipChart key="6" history={history} />,
    ],
  },
  {
    key: 'events',
    label: 'Events & Community Outreach',
    color: '#EC4899',
    icon: '🎪',
    charts: (history, analysisHistory) => [
      <EventCalendarHeatmap key="1" history={history} />,
      <AttendeeTrackerChart key="2" history={history} />,
      <SatisfactionDotPlot key="3" history={history} />,
      <RepeatAttendeeGauge key="4" history={history} />,
      <SponsorVolunteerChart key="5" history={history} />,
    ],
  },
  {
    key: 'businessDevelopment',
    label: 'Business Development',
    color: '#14B8A6',
    icon: '💼',
    charts: (history, analysisHistory) => [
      <RevenueTrajectoryChart key="1" history={history} />,
      <CustomerAcquisitionChart key="2" history={history} />,
      <CACChart key="3" history={history} />,
      <SatisfactionChannelsChart key="4" history={history} />,
    ],
  },
];

function TeamSection({ team, history, analysisHistory, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  const charts = team.charts(history, analysisHistory);

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Section header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 20px', borderRadius: '10px',
          borderLeft: `4px solid ${team.color}`,
          background: team.color + '10',
          marginBottom: open ? '16px' : '0',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '22px' }}>{team.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>{team.label}</div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{charts.length} charts · click to {open ? 'collapse' : 'expand'}</div>
        </div>
        <span style={{ fontSize: '18px', color: team.color, transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
      </button>

      {open && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px',
        }}>
          {charts}
        </div>
      )}
    </div>
  );
}

export default function Analytics({ currentUser, history, analysisHistory }) {
  const isCeo = currentUser?.role === 'ceo';
  const isGM = currentUser?.role === 'generalManagement';
  const seeAll = canSeeAll(currentUser?.role);

  // Determine which teams to show
  const visibleTeams = seeAll
    ? TEAM_CONFIG
    : TEAM_CONFIG.filter(t => t.key === currentUser?.role);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Page heading */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px 0' }}>
          📊 Analytics & Infographics
        </h1>
        <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
          {isCeo
            ? 'Organisation-wide performance overview across all 5 teams — live charts powered by weekly inputs'
            : isGM
            ? 'General Management performance dashboard — submit weekly data to unlock live charts'
            : `${visibleTeams[0]?.label} performance dashboard`}
        </p>
      </div>

      {/* CEO-only AI Confidence Briefing */}
      {isCeo && (
        <AIConfidenceBriefing history={history} analysisHistory={analysisHistory} />
      )}

      {/* Team chart sections */}
      {visibleTeams.map((team, i) => (
        <TeamSection
          key={team.key}
          team={team}
          history={history}
          analysisHistory={analysisHistory}
          defaultOpen={true}
        />
      ))}
    </div>
  );
}

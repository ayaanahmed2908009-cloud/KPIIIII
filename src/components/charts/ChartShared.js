import React from 'react';

// ─── Empty state shown when no real data has been submitted ────────────────────
export function EmptyChartState({ message = 'Submit weekly inputs to unlock this chart' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px', gap: '10px', minHeight: '140px'
    }}>
      <div style={{ fontSize: '28px', opacity: 0.3 }}>📊</div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>No data yet</div>
      <div style={{ fontSize: '11px', color: '#334155', textAlign: 'center', maxWidth: '200px', lineHeight: 1.5 }}>
        {message}
      </div>
    </div>
  );
}

// ─── Shared chart card wrapper ─────────────────────────────────────────────────
export function ChartCard({ title, subtitle, isAI, insight, children, color }) {
  return (
    <div style={{
      background: '#1e293b',
      border: `1px solid ${color ? color + '20' : '#334155'}`,
      borderTop: color ? `3px solid ${color}` : '3px solid #334155',
      borderRadius: '10px',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', lineHeight: 1.3 }}>{title}</div>
          {subtitle && <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>{subtitle}</div>}
        </div>
        {isAI && (
          <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '999px', background: '#1e3a5f', color: '#60a5fa', flexShrink: 0, marginLeft: '10px' }}>
            🤖 AI
          </span>
        )}
      </div>
      {children}
      {insight && (
        <div style={{
          marginTop: '12px', paddingTop: '10px',
          borderTop: '1px solid #0f172a',
          fontSize: '12px', color: '#64748b', lineHeight: '1.5'
        }}>
          💡 {insight}
        </div>
      )}
    </div>
  );
}

// ─── Dark-theme custom tooltip ─────────────────────────────────────────────────
export function DarkTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
      padding: '10px 14px', fontSize: '12px', lineHeight: '1.6'
    }}>
      {label !== undefined && (
        <div style={{ color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>Week {label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color || p.fill }} />
          <span style={{ color: '#94a3b8' }}>{p.name}:</span>
          <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
            {formatter ? formatter(p.value, p.name) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── SVG Semi-circle Gauge ─────────────────────────────────────────────────────
export function SemiGauge({ value, min = 0, max = 100, target, zones, label, unit = '%', size = 160 }) {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const angle = pct * 180 - 90; // -90 = leftmost, 90 = rightmost
  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2 + 10;

  // needle endpoint
  const rad = (angle * Math.PI) / 180;
  const nx = cx + (r - 8) * Math.cos(rad);
  const ny = cy + (r - 8) * Math.sin(rad);

  // arc path for a zone
  function arcPath(startPct, endPct, radius) {
    const s = startPct * 180 - 90;
    const e = endPct * 180 - 90;
    const x1 = cx + radius * Math.cos((s * Math.PI) / 180);
    const y1 = cy + radius * Math.sin((s * Math.PI) / 180);
    const x2 = cx + radius * Math.cos((e * Math.PI) / 180);
    const y2 = cy + radius * Math.sin((e * Math.PI) / 180);
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  }

  // target tick
  const targetPct = target !== undefined ? (target - min) / (max - min) : null;
  const targetAngle = targetPct !== null ? targetPct * 180 - 90 : null;

  return (
    <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
      {/* Zone arcs */}
      {zones && zones.map((z, i) => (
        <path
          key={i}
          d={arcPath(
            (z.from - min) / (max - min),
            (z.to - min) / (max - min),
            r
          )}
          stroke={z.color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
      {/* Track */}
      {!zones && (
        <path d={arcPath(0, 1, r)} stroke="#1e293b" strokeWidth="10" fill="none" />
      )}
      {/* Target tick */}
      {targetAngle !== null && (() => {
        const tr = (targetAngle * Math.PI) / 180;
        const tx1 = cx + (r - 14) * Math.cos(tr);
        const ty1 = cy + (r - 14) * Math.sin(tr);
        const tx2 = cx + (r + 2) * Math.cos(tr);
        const ty2 = cy + (r + 2) * Math.sin(tr);
        return <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />;
      })()}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#f1f5f9" />
      {/* Value label */}
      <text x={cx} y={cy + 18} textAnchor="middle" fill="#f1f5f9" fontSize="16" fontWeight="700">
        {value}{unit}
      </text>
      {label && (
        <text x={cx} y={cy + 32} textAnchor="middle" fill="#475569" fontSize="10">
          {label}
        </text>
      )}
    </svg>
  );
}

// ─── Stat pill ─────────────────────────────────────────────────────────────────
export function StatPill({ label, value, color = '#f1f5f9', bg = '#0f172a' }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}20`, borderRadius: '8px', padding: '8px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: '11px', color: '#475569', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: '800', color }}>{value}</div>
    </div>
  );
}

// ─── AI Insight Box ────────────────────────────────────────────────────────────
export function AIInsightBox({ text, verdict, verdictColor = '#fbbf24' }) {
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #334155',
      borderLeft: `3px solid ${verdictColor}`,
      borderRadius: '0 8px 8px 0', padding: '12px 16px', marginTop: '12px'
    }}>
      {verdict && (
        <div style={{ fontSize: '11px', fontWeight: '700', color: verdictColor, textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.06em' }}>
          🤖 AI Insight · {verdict}
        </div>
      )}
      <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>{text}</div>
    </div>
  );
}

// ─── Recharts shared props ─────────────────────────────────────────────────────
export const CHART_DEFAULTS = {
  margin: { top: 5, right: 10, left: -10, bottom: 5 },
  labelStyle: { fill: '#475569', fontSize: 11 },
  axisStyle: { stroke: '#1e293b', tick: { fill: '#475569', fontSize: 10 } },
  gridStyle: { stroke: '#1e293b', strokeDasharray: '3 3' }
};

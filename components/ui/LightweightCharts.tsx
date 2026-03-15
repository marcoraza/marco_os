import React from 'react';

interface SeriesConfig {
  key: string;
  label: string;
  color: string;
  fillOpacity?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getNumericValues<T extends object>(data: T[], keys: string[]) {
  return data.flatMap((item) => keys.map((key) => Number((item as Record<string, unknown>)[key] || 0)));
}

function createLinePath(points: Array<[number, number]>) {
  if (points.length === 0) return '';
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function createAreaPath(points: Array<[number, number]>, baseY: number) {
  if (points.length === 0) return '';
  const line = createLinePath(points);
  const [lastX] = points[points.length - 1];
  const [firstX] = points[0];
  return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number): [number, number] {
  const radians = (angle - 90) * (Math.PI / 180);
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
}

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

export function MiniDonutChart({
  data,
  colors,
  centerLabel,
  centerSubLabel,
}: {
  data: Array<{ name: string; value: number }>;
  colors: string[];
  centerLabel: string;
  centerSubLabel?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 180 180" className="h-full w-full">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--color-border-panel)" strokeWidth="18" />
        {data.map((item, index) => {
          const portion = item.value / total;
          const dash = portion * circumference;
          const offset = -cumulative * circumference;
          cumulative += portion;
          return (
            <circle
              key={item.name}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={colors[index % colors.length]}
              strokeWidth="18"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              transform="rotate(-90 90 90)"
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-sm font-bold font-mono text-text-primary">{centerLabel}</div>
        {centerSubLabel && <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-text-secondary">{centerSubLabel}</div>}
      </div>
    </div>
  );
}

export function MiniLineAreaChart<T extends object>({
  data,
  xKey,
  series,
  yMax,
  showGrid = true,
  showDots = false,
  compact = false,
}: {
  data: T[];
  xKey: keyof T;
  series: SeriesConfig[];
  yMax?: number;
  showGrid?: boolean;
  showDots?: boolean;
  compact?: boolean;
}) {
  const width = 520;
  const height = compact ? 120 : 220;
  const padding = compact
    ? { top: 12, right: 10, bottom: 18, left: 10 }
    : { top: 16, right: 14, bottom: 28, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = getNumericValues(data, series.map((item) => item.key));
  const maxValue = yMax || Math.max(...values, 1);
  const minValue = 0;
  const xStep = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  const pointsFor = (key: string) =>
    data.map((item, index) => {
      const x = padding.left + index * xStep;
      const raw = Number((item as Record<string, unknown>)[key] || 0);
      const ratio = (raw - minValue) / Math.max(maxValue - minValue, 1);
      const y = padding.top + chartHeight - ratio * chartHeight;
      return [x, y] as [number, number];
    });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {showGrid &&
        [0, 0.25, 0.5, 0.75, 1].map((step) => {
          const y = padding.top + chartHeight * step;
          return <line key={step} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--color-border-panel)" strokeDasharray="3 3" />;
        })}
      {!compact &&
        [0, 0.5, 1].map((step) => {
          const y = padding.top + chartHeight * step;
          const value = maxValue - maxValue * step;
          return (
            <text key={step} x={8} y={y + 4} fill="var(--color-text-secondary)" style={{ fontSize: 10, fontFamily: 'monospace' }}>
              {formatNumber(value)}
            </text>
          );
        })}
      {data.map((item, index) => {
        const x = padding.left + index * xStep;
        const label = String((item as Record<string, unknown>)[String(xKey)] || '');
        return (
          <text
            key={`${label}-${index}`}
            x={x}
            y={height - 8}
            textAnchor="middle"
            fill="var(--color-text-secondary)"
            style={{ fontSize: compact ? 8 : 10, fontFamily: 'monospace' }}
          >
            {label}
          </text>
        );
      })}
      {series.map((item) => {
        const points = pointsFor(item.key);
        const area = createAreaPath(points, padding.top + chartHeight);
        const line = createLinePath(points);
        return (
          <g key={item.key}>
            {!compact && item.fillOpacity ? (
              <path d={area} fill={item.color} opacity={item.fillOpacity} />
            ) : null}
            <path d={line} fill="none" stroke={item.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {showDots &&
              points.map(([x, y], index) => (
                <circle key={`${item.key}-${index}`} cx={x} cy={y} r="3.5" fill={item.color} stroke="var(--color-bg-surface)" strokeWidth="2" />
              ))}
          </g>
        );
      })}
    </svg>
  );
}

export function MiniBarChart({
  data,
  maxValue,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  maxValue?: number;
}) {
  const width = 520;
  const height = 140;
  const padding = { top: 12, right: 12, bottom: 26, left: 12 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / Math.max(data.length, 1) * 0.58;
  const gap = chartWidth / Math.max(data.length, 1);
  const upper = maxValue || Math.max(...data.map((item) => item.value), 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {data.map((item, index) => {
        const x = padding.left + index * gap + (gap - barWidth) / 2;
        const barHeight = (item.value / upper) * chartHeight;
        const y = padding.top + chartHeight - barHeight;
        return (
          <g key={item.label}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill={item.color} />
            <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fill="var(--color-text-secondary)" style={{ fontSize: 8, fontFamily: 'monospace' }}>
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function MiniStackedBarChart({
  data,
  keys,
}: {
  data: Array<{ label: string; [key: string]: string | number }>;
  keys: Array<{ key: string; color: string }>;
}) {
  const width = 520;
  const height = 180;
  const padding = { top: 10, right: 10, bottom: 24, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / Math.max(data.length, 1) * 0.5;
  const gap = chartWidth / Math.max(data.length, 1);
  const maxValue = Math.max(...data.map((item) => keys.reduce((sum, key) => sum + Number(item[key.key] || 0), 0)), 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {data.map((item, index) => {
        const x = padding.left + index * gap + (gap - barWidth) / 2;
        let stackBottom = padding.top + chartHeight;
        return (
          <g key={String(item.label)}>
            {keys.map((entry) => {
              const value = Number(item[entry.key] || 0);
              const segmentHeight = (value / maxValue) * chartHeight;
              stackBottom -= segmentHeight;
              return <rect key={entry.key} x={x} y={stackBottom} width={barWidth} height={segmentHeight} fill={entry.color} rx="2" />;
            })}
            <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fill="var(--color-text-secondary)" style={{ fontSize: 9, fontFamily: 'monospace' }}>
              {String(item.label)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function MiniRadarChart({
  data,
  color,
}: {
  data: Array<{ label: string; value: number }>;
  color: string;
}) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 72;
  const maxValue = 10;
  const angleStep = 360 / Math.max(data.length, 1);
  const polygonPoints = data
    .map((item, index) => {
      const ratio = clamp(item.value / maxValue, 0, 1);
      const [x, y] = polarToCartesian(cx, cy, radius * ratio, index * angleStep);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <circle key={ring} cx={cx} cy={cy} r={radius * ring} fill="none" stroke="var(--color-border-panel)" />
      ))}
      {data.map((item, index) => {
        const [x, y] = polarToCartesian(cx, cy, radius, index * angleStep);
        return (
          <g key={item.label}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--color-border-panel)" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="var(--color-text-secondary)" style={{ fontSize: 11 }}>
              {item.label}
            </text>
          </g>
        );
      })}
      <polygon points={polygonPoints} fill={color} opacity="0.18" stroke={color} strokeWidth="2.5" />
    </svg>
  );
}

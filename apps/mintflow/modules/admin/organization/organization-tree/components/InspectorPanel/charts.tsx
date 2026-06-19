"use client";

import { Text } from "@peppermint/ui";

// ── Seeded RNG ────────────────────────────────────────────────────────────────

export function makeSeededRng(seed: string) {
  let s = seed.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0x12345678);
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 0xffffffff;
  };
}

// ── Card shell ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function KpiCard({ title, children, style }: KpiCardProps) {
  return (
    <div style={{
      background: "var(--mantine-color-default)",
      border: "1px solid var(--mantine-color-default-border)",
      borderRadius: 16,
      padding: "16px 16px 14px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      ...style,
    }}>
      {title && (
        <Text size="xs" fw={600} c="dimmed" style={{ letterSpacing: "0.06em", marginBottom: 12, fontSize: 10 }}>
          {title}
        </Text>
      )}
      {children}
    </div>
  );
}

// ── Inline sparkline ──────────────────────────────────────────────────────────

interface SparklineBarProps {
  data: number[];
  color?: string;
  activeColor?: string;
  width?: number;
  height?: number;
}

export function SparklineBar({ data, color = "#ddd6fe", activeColor = "#7c3aed", width = 64, height = 40 }: SparklineBarProps) {
  const max = Math.max(...data, 1);
  const barW = Math.max(4, Math.floor((width - (data.length - 1) * 2) / data.length));
  return (
    <svg width={width} height={height} style={{ flexShrink: 0, display: "block" }}>
      {data.map((v, i) => {
        const h = Math.max(3, (v / max) * (height - 4));
        return (
          <rect
            key={i}
            x={i * (barW + 2)}
            y={height - h}
            width={barW}
            height={h}
            rx={2}
            fill={i === data.length - 1 ? activeColor : color}
          />
        );
      })}
    </svg>
  );
}

// ── Stat row (large number + delta + sparkline) ───────────────────────────────

interface StatRowProps {
  title: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  description?: string;
  sparkData?: number[];
  sparkColor?: string;
  sparkActiveColor?: string;
  valueColor?: string;
}

export function StatRow({
  title, value, delta, deltaPositive, description, sparkData, sparkColor, sparkActiveColor, valueColor,
}: StatRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text size="xs" c="dimmed" style={{ fontSize: 11, marginBottom: 4 }}>{title}</Text>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
          <Text fw={700} c={valueColor ?? "dark"} style={{ fontSize: 26, lineHeight: 1 }}>{value}</Text>
          {delta && (
            <Text fw={600} c={deltaPositive ? "teal" : "red"} style={{ fontSize: 11 }}>
              {deltaPositive ? "↗" : "↘"} {delta}
            </Text>
          )}
        </div>
        {description && (
          <Text size="xs" c="dimmed" style={{ fontSize: 10, marginTop: 5 }} lineClamp={2}>{description}</Text>
        )}
      </div>
      {sparkData && sparkData.length > 0 && (
        <SparklineBar data={sparkData} color={sparkColor} activeColor={sparkActiveColor} />
      )}
    </div>
  );
}

// ── Stacked horizontal bar ────────────────────────────────────────────────────

interface StackedBarProps {
  segments: Array<{ label: string; value: number; color: string; delta?: string; deltaPositive?: boolean }>;
  total?: number;
}

export function StackedBar({ segments, total }: StackedBarProps) {
  const sum = (total ?? segments.reduce((a, s) => a + s.value, 0)) || 1;
  return (
    <div>
      <div style={{ display: "flex", height: 9, borderRadius: 99, overflow: "hidden", gap: 2 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ flex: s.value / sum, background: s.color, minWidth: 4 }} />
        ))}
      </div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {segments.map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--mantine-color-gray-0)",
              borderRadius: 10,
              padding: "7px 10px",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <Text size="xs" fw={500}>{s.label}</Text>
              <Text size="xs" c="dimmed">— {s.value.toLocaleString()}</Text>
            </div>
            {s.delta && (
              <Text fw={600} c={s.deltaPositive ? "teal" : "red"} style={{ fontSize: 10, whiteSpace: "nowrap" }}>
                {s.deltaPositive ? "↗" : "↘"} {s.delta}
              </Text>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

interface MiniBarChartProps {
  data: number[];
  labels: string[];
  color?: string;
  activeColor?: string;
  height?: number;
}

export function MiniBarChart({ data, labels, color = "#ddd6fe", activeColor = "#7c3aed", height = 88 }: MiniBarChartProps) {
  const max = Math.max(...data, 1);
  const barH = height - 18;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: height + 4, width: "100%" }}>
      {data.map((v, i) => {
        const isLast = i === data.length - 1;
        const h = Math.max(5, (v / max) * barH);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: "100%", height: h,
              background: isLast ? activeColor : color,
              borderRadius: "4px 4px 0 0",
              opacity: isLast ? 1 : 0.85,
            }} />
            <Text style={{ fontSize: 9, color: "var(--mantine-color-dimmed)", whiteSpace: "nowrap" }}>{labels[i]}</Text>
          </div>
        );
      })}
    </div>
  );
}

// ── Ring chart ────────────────────────────────────────────────────────────────

interface RingChartProps {
  segments: Array<{ value: number; color: string; label: string }>;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}

export function RingChart({ segments, size = 92, thickness = 10, centerLabel, centerSub }: RingChartProps) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;
  const arcs = segments.map((seg) => {
    const len = (seg.value / total) * circ;
    const arc = { offset: circ - offset, len, ...seg };
    offset += len;
    return arc;
  });
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--mantine-color-gray-2)" strokeWidth={thickness} />
        {arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color}
            strokeWidth={thickness} strokeDasharray={`${arc.len} ${circ}`}
            strokeDashoffset={arc.offset} strokeLinecap="round" />
        ))}
      </svg>
      {(centerLabel || centerSub) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {centerLabel && <Text fw={700} style={{ fontSize: 15, lineHeight: 1 }}>{centerLabel}</Text>}
          {centerSub && <Text c="dimmed" style={{ fontSize: 9, marginTop: 2 }}>{centerSub}</Text>}
        </div>
      )}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export function ProgressBar({ label, value, max = 100, color = "#7c3aed" }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <Text size="xs" c="dimmed">{label}</Text>
        <Text size="xs" fw={700} c="dark">{pct}%</Text>
      </div>
      <div style={{ height: 7, borderRadius: 99, background: "var(--mantine-color-gray-1)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: color, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ── Activity heatmap ──────────────────────────────────────────────────────────

interface ActivityHeatmapProps {
  data: number[];
  weeks?: number;
  color?: string;
}

const HEATMAP_COLORS: Record<string, string[]> = {
  violet: ["var(--mantine-color-gray-1)", "#ede9fe", "#c4b5fd", "#8b5cf6", "#5b21b6"],
  teal:   ["var(--mantine-color-gray-1)", "#ccfbf1", "#5eead4", "#14b8a6", "#0f766e"],
};

export function ActivityHeatmap({ data, weeks = 26, color = "violet" }: ActivityHeatmapProps) {
  const palette = HEATMAP_COLORS[color] ?? HEATMAP_COLORS.violet;
  const cells = data.slice(0, weeks * 7);
  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateRows: "repeat(7, 9px)",
        gridTemplateColumns: `repeat(${weeks}, 1fr)`,
        gap: 3,
      }}>
        {cells.map((v, i) => (
          <div key={i} style={{ borderRadius: 2, background: palette[Math.min(4, Math.max(0, v))] ?? palette[0] }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={{ fontSize: 9 }} c="dimmed">6 months ago</Text>
        <Text style={{ fontSize: 9 }} c="dimmed">Today</Text>
      </div>
    </div>
  );
}

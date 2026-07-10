import type { CSSProperties } from "react";

export const MINI_CALENDAR_COLORS = {
  background: "var(--mantine-color-gray-9)",
  cream: "#F4F5F0",
  pink: "#E84D8A",
  textWhite: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textDark: "#1A1A1A",
  borderMuted: "rgba(255,255,255,0.22)",
  dashedEmpty: "rgba(255,255,255,0.3)",
} as const;

export const miniCalendarCardStyle = (): CSSProperties => ({
  background: MINI_CALENDAR_COLORS.background,
  borderRadius: 24,
  padding: 20,
  width: "100%",
  height: "auto",
  flexShrink: 0,
  overflow: "visible",
});

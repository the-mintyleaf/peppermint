import type { CSSProperties } from "react";

export const ANALYTICS_COLORS = {
  surface: "var(--mantine-color-gray-9)",
  workspace: "#F4F5F0",
  accentOrange: "#FF5C00",
  accentPink: "#FF4081",
  accentPurple: "#9C27B0",
  accentYellow: "#FFC107",
  accentGreen: "#4CAF50",
  textPrimary: "#F4F5F0",
  textMuted: "rgba(244,245,240,0.6)",
  textDark: "#1B3320",
  cardOrange: "#FF6B35",
  cardPurple: "#7B5CE8",
  cardPink: "#E84D8A",
  cardYellow: "#F5B942",
} as const;

export const darkCardStyle = (
  bg: string = ANALYTICS_COLORS.surface,
): CSSProperties => ({
  background: bg,
  borderRadius: 24,
  padding: 20,
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
});

export const workspaceCardStyle = (): CSSProperties => ({
  background: ANALYTICS_COLORS.workspace,
  borderRadius: 24,
  padding: 20,
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
});

import type { CSSProperties } from "react";

export const HOME_COLORS = {
  forest: "#1B3320",
  cream: "#F4F5F0",
  orange: "#E85D3B",
  yellow: "#F5B942",
  pink: "#E84D8A",
  purple: "#7B5CE8",
  muted: "#E8E9E3",
} as const;

export const bentoCardStyle = (bg: string): CSSProperties => ({
  background: bg,
  borderRadius: 24,
  padding: 20,
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
});

/** Fixed display scale for the artboard — not affected by user zoom. */
export const CANVAS_BASE_SCALE = 0.4;

/** Builder workspace (area around the artboard). */
export const CANVAS_WORKSPACE_BG = "#d1d5db";

/** Artboard background — exported templates use the same white surface. */
export const CANVAS_ARTBOARD_BG = "#ffffff";

/** Default element fills — chosen for clear contrast against the white artboard. */
export const DEFAULT_SHAPE_FILL = "#9ca3af";
export const DEFAULT_IMAGE_PLACEHOLDER_FILL = "#a8b4c4";
export const DEFAULT_LINE_FILL = "#4b5563";

/** Edit-mode outline for elements without a visible stroke (not serialized). */
export const BUILDER_ELEMENT_OUTLINE = "1px solid rgba(0, 0, 0, 0.2)";

/** High-contrast badge shown on elements in edit mode (not serialized). */
export const BUILDER_PLACEHOLDER_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  color: "#ffffff",
  background: "rgba(0, 0, 0, 0.55)",
  padding: "3px 8px",
  borderRadius: 4,
  lineHeight: 1.2,
  pointerEvents: "none" as const,
  maxWidth: "90%",
  overflow: "hidden" as const,
  textOverflow: "ellipsis" as const,
  whiteSpace: "nowrap" as const,
};

/** User zoom multiplier (1 = 100%). Applied via CSS transform, not layout resize. */
export const DEFAULT_CANVAS_ZOOM = 1;
export const MIN_CANVAS_ZOOM = 0.5;
export const MAX_CANVAS_ZOOM = 2;
export const CANVAS_ZOOM_FACTOR = 1.08;

export function clampCanvasZoom(zoom: number): number {
  return Math.min(
    MAX_CANVAS_ZOOM,
    Math.max(MIN_CANVAS_ZOOM, Math.round(zoom * 100) / 100),
  );
}

export function zoomPercent(zoom: number): number {
  return Math.round(zoom * 100);
}

export function nextZoomIn(zoom: number): number {
  return clampCanvasZoom(zoom * CANVAS_ZOOM_FACTOR);
}

export function nextZoomOut(zoom: number): number {
  return clampCanvasZoom(zoom / CANVAS_ZOOM_FACTOR);
}

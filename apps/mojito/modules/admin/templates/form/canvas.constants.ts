/** Fixed display scale for the artboard — not affected by user zoom. */
export const CANVAS_BASE_SCALE = 0.4;

/** User zoom multiplier (1 = 100%). Applied via CSS transform, not layout resize. */
export const DEFAULT_CANVAS_ZOOM = 1;
export const MIN_CANVAS_ZOOM = 0.5;
export const MAX_CANVAS_ZOOM = 2;
export const CANVAS_ZOOM_FACTOR = 1.08;

export function clampCanvasZoom(zoom: number): number {
  return Math.min(MAX_CANVAS_ZOOM, Math.max(MIN_CANVAS_ZOOM, Math.round(zoom * 100) / 100));
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

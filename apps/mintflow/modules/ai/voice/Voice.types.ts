/** Descriptor for a single vertical bar in the voice meter. */
export interface VoiceBar {
  /** Active (listening) height in px — the bar's animated peak. */
  height: number;
  /** Per-bar animation duration in seconds. */
  duration: number;
  /** Per-bar animation delay in seconds (staggers the wave). */
  delay: number;
  /** Distance from the center of the meter (0 = center, 1 = edge). */
  edge: number;
}

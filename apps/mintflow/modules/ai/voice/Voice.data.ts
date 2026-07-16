import type { VoiceBar } from "./Voice.types";

const BAR_COUNT = 48;
const METER_HEIGHT = 66;

/**
 * Deterministic voice-meter bars — computed once at module load (never random
 * at render, so the wave is stable across re-renders). Height, duration, and
 * delay all vary by index so the bars form an organic staggered wave, tallest
 * toward the center and shorter toward the edges.
 */
export const VOICE_BARS: VoiceBar[] = Array.from(
  { length: BAR_COUNT },
  (_, i): VoiceBar => {
    const mid = (BAR_COUNT - 1) / 2;
    const edge = Math.abs(i - mid) / mid; // 0 center → 1 edge

    // Center-weighted envelope + two interfering sines for organic variation.
    const envelope = 1 - edge * 0.55;
    const wave =
      0.5 + 0.5 * Math.sin(i * 0.9) * 0.6 + 0.5 * Math.sin(i * 0.37) * 0.4;
    const height = Math.round(14 + wave * envelope * (METER_HEIGHT - 14));

    return {
      height: Math.max(10, Math.min(METER_HEIGHT, height)),
      duration: 0.7 + (i % 5) * 0.09,
      delay: (i % 7) * 0.06,
      edge,
    };
  },
);

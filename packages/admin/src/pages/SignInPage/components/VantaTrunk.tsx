"use client";

import { useEffect, useRef } from "react";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function VantaTrunk() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // vanta has no published TypeScript declarations; accessed via window global
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let effect: { destroy: () => void } | null = null;

    const init = async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.7/p5.min.js"
      );
      await loadScript(
        "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.trunk.min.js"
      );

      if (!ref.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const VANTA = (window as any).VANTA;
      if (!VANTA?.TRUNK) return;

      effect = VANTA.TRUNK({
        el: ref.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1.5,
        scaleMobile: 1.5,
        color: 0x1d7e59,
        backgroundColor: 0x111111,
      });
    };

    init();

    return () => {
      effect?.destroy();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "700px",
        height: "700px",
        transform: "translate(-50%, 50%)",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

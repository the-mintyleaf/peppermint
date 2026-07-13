import { useState, useEffect } from "react";

export interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  // Start at 0/0 so server and first client render agree (no hydration mismatch);
  // the real size is measured in the mount effect below.
  const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });

  useEffect(() => {
    let frame = 0;
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    // Throttle to one update per animation frame.
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return size;
}

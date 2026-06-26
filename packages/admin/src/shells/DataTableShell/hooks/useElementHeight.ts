"use client";

import { useEffect, useState, type RefObject } from "react";

export function useElementHeight(ref: RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    ro.observe(el);
    setHeight(el.getBoundingClientRect().height);

    return () => ro.disconnect();
  }, [ref]);

  return height;
}

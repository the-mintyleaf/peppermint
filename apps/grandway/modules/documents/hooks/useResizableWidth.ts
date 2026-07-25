"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseResizableWidthOptions {
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function useResizableWidth({
  initialWidth = 200,
  minWidth = 120,
  maxWidth = 480,
}: UseResizableWidthOptions = {}) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(initialWidth);

  const startResize = useCallback(
    (event: React.MouseEvent, side: "left" | "right") => {
      event.preventDefault();
      startXRef.current = event.clientX;
      startWidthRef.current = width;
      setIsResizing(true);

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta =
          side === "left"
            ? moveEvent.clientX - startXRef.current
            : startXRef.current - moveEvent.clientX;
        const nextWidth = Math.min(
          maxWidth,
          Math.max(minWidth, startWidthRef.current + delta),
        );
        setWidth(nextWidth);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [width, minWidth, maxWidth],
  );

  useEffect(() => {
    if (!isResizing) return;
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  return { width, startResize, isResizing };
}

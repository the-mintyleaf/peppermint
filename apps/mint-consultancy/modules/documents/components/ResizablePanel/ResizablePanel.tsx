"use client";

import type { ReactNode } from "react";
import styles from "../../pages/editor/DocumentEditor.module.css";

interface ResizablePanelProps {
  width: number;
  side: "left" | "right";
  onResizeStart: (event: React.MouseEvent) => void;
  children: ReactNode;
}

export function ResizablePanel({
  width,
  side,
  onResizeStart,
  children,
}: ResizablePanelProps) {
  return (
    <div
      className={styles.resizablePanel}
      style={{ width }}
      data-side={side}
    >
      {children}
      <div
        className={`${styles.resizeHandle} ${
          side === "left" ? styles.resizeHandleRight : styles.resizeHandleLeft
        }`}
        onMouseDown={onResizeStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        tabIndex={0}
      />
    </div>
  );
}

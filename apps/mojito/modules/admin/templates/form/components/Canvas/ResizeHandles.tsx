"use client";

import type { CanvasElement } from "../../templateForm.types";
import type { ResizeHandle } from "../../canvas.resize.utils";
import { CANVAS_BASE_SCALE } from "../../canvas.constants";

const HANDLES: {
  id: ResizeHandle;
  cursor: string;
  left: string;
  top: string;
}[] = [
  { id: "nw", cursor: "nw-resize", left: "0%", top: "0%" },
  { id: "ne", cursor: "ne-resize", left: "100%", top: "0%" },
  { id: "sw", cursor: "sw-resize", left: "0%", top: "100%" },
  { id: "se", cursor: "se-resize", left: "100%", top: "100%" },
];

const HANDLE_SIZE = 8;

interface ResizeHandlesProps {
  el: CanvasElement;
  onResizeStart: (handle: ResizeHandle, e: React.PointerEvent) => void;
}

export function ResizeHandles({ el, onResizeStart }: ResizeHandlesProps) {
  const scale = CANVAS_BASE_SCALE;

  return (
    <div
      style={{
        position: "absolute",
        left: el.x * scale,
        top: el.y * scale,
        width: el.width * scale,
        height: el.height * scale,
        pointerEvents: "none",
        zIndex: el.zIndex + 1,
      }}
    >
      {HANDLES.map((handle) => (
        <div
          key={handle.id}
          role="presentation"
          onPointerDown={(e) => onResizeStart(handle.id, e)}
          style={{
            position: "absolute",
            left: handle.left,
            top: handle.top,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            marginLeft: -HANDLE_SIZE / 2,
            marginTop: -HANDLE_SIZE / 2,
            background: "#fff",
            border: "2px solid var(--mantine-color-blue-6)",
            borderRadius: 1,
            boxSizing: "border-box",
            cursor: handle.cursor,
            pointerEvents: "auto",
          }}
        />
      ))}
    </div>
  );
}

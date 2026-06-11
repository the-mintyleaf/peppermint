"use client";

import { useRef, useCallback, useState } from "react";
import { Box, Text } from "@zetsel/ui";
import { useBuilderStore } from "../../TemplateBuilder.store";
import type { CanvasElement, ElementType } from "../../templateForm.types";
import { resolveElementRect } from "../../elementDefaults";
import { CANVAS_BASE_SCALE } from "../../canvas.constants";
import { CanvasToolbar } from "./CanvasToolbar";
import { CanvasZoomControls } from "./CanvasZoomControls";

export { CANVAS_BASE_SCALE as CANVAS_SCALE } from "../../canvas.constants";

const CREATE_TOOLS: ElementType[] = [
  "text",
  "image",
  "rectangle",
  "circle",
  "line",
  "dynamicText",
  "staticText",
];

function isCreateTool(tool: string): tool is ElementType {
  return CREATE_TOOLS.includes(tool as ElementType);
}

function elementOpacity(el: CanvasElement): number {
  return (el.props.opacity ?? 100) / 100;
}

function strokeStyle(el: CanvasElement): string | undefined {
  const width = el.props.strokeWidth ?? 0;
  if (!el.props.stroke || width <= 0) return undefined;
  return `${width}px solid ${el.props.stroke}`;
}

function getElementStyle(el: CanvasElement, selected: boolean): React.CSSProperties {
  const scale = CANVAS_BASE_SCALE;
  const base: React.CSSProperties = {
    position: "absolute",
    left: el.x * scale,
    top: el.y * scale,
    width: el.width * scale,
    height: el.height * scale,
    boxSizing: "border-box",
    outline: selected ? "2px solid var(--mantine-color-blue-6)" : undefined,
    outlineOffset: 2,
    cursor: el.locked ? "not-allowed" : "pointer",
    userSelect: "none",
    zIndex: el.zIndex,
    opacity: elementOpacity(el),
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    transformOrigin: "center center",
  };

  switch (el.type) {
    case "rectangle":
      return {
        ...base,
        background: el.props.fill ?? "#f3f4f6",
        border: strokeStyle(el),
        borderRadius: (el.props.borderRadius ?? 0) * scale,
      };
    case "circle":
      return {
        ...base,
        background: el.props.fill ?? "#f3f4f6",
        border: strokeStyle(el),
        borderRadius: "50%",
      };
    case "line":
      return {
        ...base,
        background: el.props.fill ?? el.props.stroke ?? "#e5e7eb",
      };
    case "image":
      return {
        ...base,
        background: el.props.fill ?? "#e5e7eb",
        border: strokeStyle(el),
        borderRadius: (el.props.borderRadius ?? 0) * scale,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };
    case "text":
    case "staticText":
      return {
        ...base,
        fontSize: (el.props.fontSize ?? 32) * scale,
        fontFamily: el.props.fontFamily,
        color: el.props.fill ?? "#000",
        display: "flex",
        alignItems: "center",
      };
    case "dynamicText":
      return {
        ...base,
        fontSize: (el.props.fontSize ?? 32) * scale,
        fontFamily: el.props.fontFamily,
        color: el.props.fill ?? "#333",
        background: "rgba(59,130,246,0.08)",
        border: "1px dashed rgba(59,130,246,0.4)",
        display: "flex",
        alignItems: "center",
        padding: "0 4px",
        borderRadius: (el.props.borderRadius ?? 4) * scale,
      };
    default:
      return base;
  }
}

function getDrawPreviewStyle(
  type: ElementType,
  rect: { x: number; y: number; width: number; height: number }
): React.CSSProperties {
  const scale = CANVAS_BASE_SCALE;
  const base: React.CSSProperties = {
    position: "absolute",
    left: rect.x * scale,
    top: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
    boxSizing: "border-box",
    pointerEvents: "none",
    zIndex: 9999,
    outline: "2px dashed var(--mantine-color-blue-6)",
    outlineOffset: 0,
    background: "rgba(13,153,255,0.06)",
  };

  if (type === "circle") {
    return { ...base, borderRadius: "50%" };
  }

  if (type === "line") {
    return { ...base, background: "rgba(13,153,255,0.15)" };
  }

  return base;
}

function ElementContent({ el, preview }: { el: CanvasElement; preview: boolean }) {
  if (el.type === "image") {
    if (el.props.imageUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={el.props.imageUrl}
          alt={el.purpose}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          draggable={false}
        />
      );
    }
    return <span style={{ fontSize: 10, color: "#9ca3af" }}>Image</span>;
  }

  if (el.type === "dynamicText") {
    if (preview) {
      return <span>{el.props.text ?? `{{${el.props.dataKey ?? "slot"}}}`}</span>;
    }
    return (
      <span style={{ opacity: 0.7, fontSize: "0.9em" }}>
        [{el.props.dataKey ?? "slot"}] {el.purpose}
      </span>
    );
  }

  if (el.type === "text" || el.type === "staticText") {
    return <span>{el.props.text ?? ""}</span>;
  }

  return null;
}

function canvasCoords(
  canvas: HTMLDivElement,
  clientX: number,
  clientY: number,
  logicalWidth: number,
  logicalHeight: number
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / (rect.width / logicalWidth),
    y: (clientY - rect.top) / (rect.height / logicalHeight),
  };
}

export function Canvas() {
  const {
    templateMeta,
    elements,
    selectedElementId,
    selectElement,
    previewMode,
    activeTool,
    canvasZoom,
    updateElement,
    commitElementUpdate,
    addElementAtRect,
    zoomIn,
    zoomOut,
  } = useBuilderStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const drawRef = useRef<{
    type: ElementType;
    anchorX: number;
    anchorY: number;
  } | null>(null);

  const [drawPreview, setDrawPreview] = useState<{
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const canvasW = templateMeta.width * CANVAS_BASE_SCALE;
  const canvasH = templateMeta.height * CANVAS_BASE_SCALE;
  const isDrawingTool = isCreateTool(activeTool);

  const sortedElements = [...elements]
    .filter((el) => el.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const getCoords = useCallback(
    (canvas: HTMLDivElement, clientX: number, clientY: number) =>
      canvasCoords(canvas, clientX, clientY, templateMeta.width, templateMeta.height),
    [templateMeta.width, templateMeta.height]
  );

  const handleMovePointerMove = useCallback(
    (e: PointerEvent) => {
      const drag = dragRef.current;
      const canvas = canvasRef.current;
      if (!drag || !canvas) return;

      const { x, y } = getCoords(canvas, e.clientX, e.clientY);
      updateElement(
        drag.id,
        { x: Math.round(x - drag.offsetX), y: Math.round(y - drag.offsetY) },
        { recordHistory: false }
      );
    },
    [updateElement, getCoords]
  );

  const handleMovePointerUp = useCallback(
    (e: PointerEvent) => {
      const drag = dragRef.current;
      const canvas = canvasRef.current;
      if (!drag || !canvas) return;

      const { x, y } = getCoords(canvas, e.clientX, e.clientY);
      commitElementUpdate(drag.id, {
        x: Math.round(x - drag.offsetX),
        y: Math.round(y - drag.offsetY),
      });
      dragRef.current = null;

      window.removeEventListener("pointermove", handleMovePointerMove);
      window.removeEventListener("pointerup", handleMovePointerUp);
    },
    [commitElementUpdate, handleMovePointerMove, getCoords]
  );

  const handleDrawPointerMove = useCallback(
    (e: PointerEvent) => {
      const draw = drawRef.current;
      const canvas = canvasRef.current;
      if (!draw || !canvas) return;

      const { x, y } = getCoords(canvas, e.clientX, e.clientY);
      const constrainSquare = e.shiftKey && draw.type === "image";
      const rect = resolveElementRect(draw.type, draw.anchorX, draw.anchorY, x, y, constrainSquare);
      setDrawPreview({ type: draw.type, ...rect });
    },
    [getCoords]
  );

  const handleDrawPointerUp = useCallback(
    (e: PointerEvent) => {
      const draw = drawRef.current;
      const canvas = canvasRef.current;
      if (!draw || !canvas) return;

      const { x, y } = getCoords(canvas, e.clientX, e.clientY);
      const constrainSquare = e.shiftKey && draw.type === "image";
      const rect = resolveElementRect(draw.type, draw.anchorX, draw.anchorY, x, y, constrainSquare);

      addElementAtRect(draw.type, rect.x, rect.y, rect.width, rect.height);

      drawRef.current = null;
      setDrawPreview(null);

      window.removeEventListener("pointermove", handleDrawPointerMove);
      window.removeEventListener("pointerup", handleDrawPointerUp);
    },
    [addElementAtRect, handleDrawPointerMove, getCoords]
  );

  const handleWorkspaceWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    },
    [zoomIn, zoomOut]
  );

  function handleCanvasPointerDown(e: React.PointerEvent) {
    if (previewMode || activeTool === "select" || !isCreateTool(activeTool)) return;
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoords(canvas, e.clientX, e.clientY);

    drawRef.current = {
      type: activeTool,
      anchorX: x,
      anchorY: y,
    };

    const rect = resolveElementRect(activeTool, x, y, x, y, false);
    setDrawPreview({ type: activeTool, ...rect });

    window.addEventListener("pointermove", handleDrawPointerMove);
    window.addEventListener("pointerup", handleDrawPointerUp);
  }

  function handleElementPointerDown(el: CanvasElement, e: React.PointerEvent) {
    if (el.locked || activeTool !== "select") return;

    e.stopPropagation();
    e.preventDefault();
    selectElement(el.id);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoords(canvas, e.clientX, e.clientY);

    dragRef.current = {
      id: el.id,
      offsetX: x - el.x,
      offsetY: y - el.y,
    };

    window.addEventListener("pointermove", handleMovePointerMove);
    window.addEventListener("pointerup", handleMovePointerUp);
  }

  return (
    <Box
      style={{
        flex: 1,
        background: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        padding: 24,
        position: "relative",
      }}
      onWheel={handleWorkspaceWheel}
      onClick={() => {
        if (!drawPreview) selectElement(null);
      }}
    >
      <div
        style={{
          transform: `scale(${canvasZoom})`,
          transformOrigin: "center center",
          flexShrink: 0,
        }}
      >
        <div
          ref={canvasRef}
          style={{
            width: canvasW,
            height: canvasH,
            background: "#fff",
            position: "relative",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            cursor: isDrawingTool ? "crosshair" : "default",
          }}
          onPointerDown={handleCanvasPointerDown}
          onClick={(e) => {
            if (e.target === e.currentTarget && !drawPreview) {
              selectElement(null);
            }
          }}
        >
          {sortedElements.map((el) => (
            <div
              key={el.id}
              style={{
                ...getElementStyle(el, selectedElementId === el.id),
                pointerEvents: activeTool === "select" ? "auto" : "none",
              }}
              onClick={(e) => {
                if (activeTool !== "select") return;
                e.stopPropagation();
                selectElement(el.id);
              }}
              onPointerDown={(e) => handleElementPointerDown(el, e)}
            >
              <ElementContent el={el} preview={previewMode} />
            </div>
          ))}

          {drawPreview && (
            <div style={getDrawPreviewStyle(drawPreview.type, drawPreview)} aria-hidden />
          )}

          {elements.length === 0 && !drawPreview && (
            <Box
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <Text size="sm" c="dimmed">
                {isDrawingTool
                  ? "Click and drag on the canvas to create an element"
                  : "Select a tool below, then drag on the canvas"}
              </Text>
            </Box>
          )}
        </div>
      </div>

      <CanvasToolbar />
      <CanvasZoomControls />
    </Box>
  );
}

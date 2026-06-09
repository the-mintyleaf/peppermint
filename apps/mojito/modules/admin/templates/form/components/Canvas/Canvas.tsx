"use client";

import { useRef } from "react";
import { Box, Text } from "@zetsel/ui";
import { useBuilderStore } from "../../TemplateBuilder.store";
import type { CanvasElement } from "../../templateForm.types";

const CANVAS_SCALE = 0.4;

function getElementStyle(el: CanvasElement, selected: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    left: el.x * CANVAS_SCALE,
    top: el.y * CANVAS_SCALE,
    width: el.width * CANVAS_SCALE,
    height: el.height * CANVAS_SCALE,
    boxSizing: "border-box",
    outline: selected ? "2px solid var(--mantine-color-blue-6)" : undefined,
    outlineOffset: 2,
    cursor: "pointer",
    userSelect: "none",
  };

  if (el.kind === "rectangle") {
    return {
      ...base,
      background: el.fill,
      borderRadius: el.borderRadius * CANVAS_SCALE,
      border: `${el.borderWidth}px solid ${el.borderColor}`,
    };
  }
  if (el.kind === "divider") {
    return { ...base, background: el.color, height: el.thickness };
  }
  if (el.kind === "brand_logo") {
    return { ...base, background: "#000", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" };
  }
  if (el.kind === "text_static") {
    return {
      ...base,
      fontSize: el.fontSize * CANVAS_SCALE,
      fontWeight: el.fontWeight,
      color: el.color,
      textAlign: el.textAlign,
      display: "flex",
      alignItems: "center",
    };
  }
  // slot element
  if (el.kind === "slot") {
    return {
      ...base,
      fontSize: (el.fontSize ?? 32) * CANVAS_SCALE,
      fontWeight: el.fontWeight ?? 400,
      color: el.color ?? "#333",
      textAlign: el.textAlign ?? "left",
      background: "rgba(59,130,246,0.08)",
      border: "1px dashed rgba(59,130,246,0.4)",
      display: "flex",
      alignItems: "center",
      padding: "0 4px",
      borderRadius: 4,
    };
  }
  return base;
}

function ElementLabel({ el, preview }: { el: CanvasElement; preview: boolean }) {
  if (el.kind === "slot") {
    if (preview) return <span>{el.placeholder ?? `{{${el.slotName}}}`}</span>;
    return (
      <span style={{ opacity: 0.7, fontSize: "0.9em" }}>
        [{el.slotType}] {el.slotName}
      </span>
    );
  }
  if (el.kind === "brand_logo") return <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>LOGO</span>;
  if (el.kind === "text_static") return <span>{el.content}</span>;
  return null;
}

export function Canvas() {
  const { templateMeta, elements, selectedElementId, selectElement, previewMode } = useBuilderStore();
  const canvasW = templateMeta.width * CANVAS_SCALE;
  const canvasH = templateMeta.height * CANVAS_SCALE;

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const data = e.dataTransfer.getData("element-kind");
    if (!data) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / CANVAS_SCALE);
    const y = Math.round((e.clientY - rect.top) / CANVAS_SCALE);

    const store = useBuilderStore.getState();
    const defaultSize = { width: 400, height: 60 };

    if (data === "slot_text") store.addElement({ kind: "slot", x, y, ...defaultSize, slotName: `slot_${Date.now()}`, slotType: "text", label: "Text Slot", required: false });
    else if (data === "slot_image") store.addElement({ kind: "slot", x, y, width: 300, height: 300, slotName: `img_${Date.now()}`, slotType: "image_url", label: "Image Slot", required: false });
    else if (data === "slot_color") store.addElement({ kind: "slot", x, y, width: 60, height: 60, slotName: `color_${Date.now()}`, slotType: "color", label: "Color Slot", required: false });
    else if (data === "slot_number") store.addElement({ kind: "slot", x, y, ...defaultSize, slotName: `num_${Date.now()}`, slotType: "number", label: "Number Slot", required: false });
    else if (data === "rectangle") store.addElement({ kind: "rectangle", x, y, width: 300, height: 200, fill: "#f3f4f6", borderRadius: 8, borderWidth: 0, borderColor: "#000" });
    else if (data === "divider") store.addElement({ kind: "divider", x, y, width: 800, height: 2, color: "#e5e7eb", thickness: 2 });
    else if (data === "brand_logo") store.addElement({ kind: "brand_logo", x, y, width: 120, height: 40 });
    else if (data === "text_static") store.addElement({ kind: "text_static", x, y, width: 400, height: 60, content: "Static text", fontSize: 32, fontWeight: 400, color: "#000", textAlign: "left" });
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
      }}
      onClick={() => selectElement(null)}
    >
      <div
        style={{
          width: canvasW,
          height: canvasH,
          background: "#fff",
          position: "relative",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            style={getElementStyle(el, selectedElementId === el.id)}
            onClick={(e) => {
              e.stopPropagation();
              selectElement(el.id);
            }}
          >
            <ElementLabel el={el} preview={previewMode} />
          </div>
        ))}

        {elements.length === 0 && (
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
              Drag elements from the palette to start building
            </Text>
          </Box>
        )}
      </div>
    </Box>
  );
}

import type { CanvasElementInput, ElementType } from "./templateForm.types";

const TYPE_LABELS: Record<ElementType, string> = {
  text: "Text",
  image: "Image",
  rectangle: "Rectangle",
  circle: "Circle",
  line: "Line",
  dynamicText: "Dynamic Text",
  staticText: "Static Text",
};

function defaultProps(type: ElementType): CanvasElementInput["props"] {
  switch (type) {
    case "text":
      return { text: "Text", fontSize: 32, fill: "#000000", opacity: 100 };
    case "staticText":
      return { text: "Static text", fontSize: 32, fill: "#000000", opacity: 100 };
    case "dynamicText":
      return {
        text: "Dynamic text",
        fontSize: 32,
        fill: "#333333",
        dataKey: `slot_${Date.now()}`,
        opacity: 100,
      };
    case "image":
      return { imageUrl: "", fill: "#e5e7eb", borderRadius: 0, opacity: 100 };
    case "rectangle":
      return { fill: "#f3f4f6", stroke: "#000000", strokeWidth: 0, borderRadius: 8, opacity: 100 };
    case "circle":
      return { fill: "#f3f4f6", stroke: "#000000", strokeWidth: 0, opacity: 100 };
    case "line":
      return { fill: "#e5e7eb", stroke: "#e5e7eb", strokeWidth: 1, opacity: 100 };
  }
}

function defaultSize(type: ElementType): { width: number; height: number } {
  switch (type) {
    case "text":
    case "staticText":
    case "dynamicText":
      return { width: 400, height: 60 };
    case "image":
      return { width: 300, height: 200 };
    case "rectangle":
      return { width: 300, height: 200 };
    case "circle":
      return { width: 200, height: 200 };
    case "line":
      return { width: 400, height: 4 };
  }
}

export function getDefaultSize(type: ElementType): { width: number; height: number } {
  return defaultSize(type);
}

export interface NormalizedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const CLICK_THRESHOLD = 5;
const MIN_ELEMENT_SIZE = 20;

function normalizeDragRect(
  anchorX: number,
  anchorY: number,
  currentX: number,
  currentY: number,
  constrainSquare: boolean,
  minSize: number
): NormalizedRect {
  let width = Math.abs(currentX - anchorX);
  let height = Math.abs(currentY - anchorY);
  let x = Math.min(anchorX, currentX);
  let y = Math.min(anchorY, currentY);

  if (constrainSquare) {
    const size = Math.max(width, height, minSize);
    width = size;
    height = size;
    x = currentX < anchorX ? anchorX - size : anchorX;
    y = currentY < anchorY ? anchorY - size : anchorY;
  }

  width = Math.max(width, minSize);
  height = Math.max(height, minSize);

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function resolveElementRect(
  type: ElementType,
  anchorX: number,
  anchorY: number,
  currentX: number,
  currentY: number,
  constrainSquare: boolean
): NormalizedRect {
  const dx = Math.abs(currentX - anchorX);
  const dy = Math.abs(currentY - anchorY);
  const isClick = dx < CLICK_THRESHOLD && dy < CLICK_THRESHOLD;

  if (isClick) {
    const { width, height } = defaultSize(type);
    return {
      x: Math.round(anchorX),
      y: Math.round(anchorY),
      width,
      height,
    };
  }

  const minSize = type === "line" ? 4 : MIN_ELEMENT_SIZE;
  const square = constrainSquare || type === "circle";
  const rect = normalizeDragRect(anchorX, anchorY, currentX, currentY, square, minSize);

  if (type === "line") {
    return { ...rect, height: Math.max(rect.height, 4) };
  }

  return rect;
}

export function createElementAtRect(
  type: ElementType,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number
): CanvasElementInput {
  return {
    purpose: TYPE_LABELS[type],
    type,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
    rotation: 0,
    zIndex,
    visible: true,
    locked: false,
    props: defaultProps(type),
  };
}

export function createElementDefaults(
  type: ElementType,
  canvasWidth: number,
  canvasHeight: number,
  zIndex: number
): CanvasElementInput {
  const { width, height } = defaultSize(type);

  return {
    purpose: TYPE_LABELS[type],
    type,
    x: Math.round((canvasWidth - width) / 2),
    y: Math.round((canvasHeight - height) / 2),
    width,
    height,
    rotation: 0,
    zIndex,
    visible: true,
    locked: false,
    props: defaultProps(type),
  };
}

export function getElementTypeLabel(type: ElementType): string {
  return TYPE_LABELS[type];
}

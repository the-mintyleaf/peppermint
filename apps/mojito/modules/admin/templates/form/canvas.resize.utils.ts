import type { NormalizedRect } from "./elementDefaults";
import type { ElementType } from "./templateForm.types";

export type ResizeHandle = "nw" | "ne" | "sw" | "se";

const MIN_SHAPE_SIZE = 20;
const MIN_LINE_SIZE = 4;

export function getMinElementSize(type: ElementType): number {
  return type === "line" ? MIN_LINE_SIZE : MIN_SHAPE_SIZE;
}

export function resizeRectFromHandle(
  handle: ResizeHandle,
  anchor: NormalizedRect,
  pointerX: number,
  pointerY: number,
  minSize: number,
  constrainSquare: boolean,
): NormalizedRect {
  const right = anchor.x + anchor.width;
  const bottom = anchor.y + anchor.height;

  let x = anchor.x;
  let y = anchor.y;
  let width = anchor.width;
  let height = anchor.height;

  switch (handle) {
    case "se":
      width = pointerX - anchor.x;
      height = pointerY - anchor.y;
      break;
    case "sw":
      x = pointerX;
      width = right - pointerX;
      height = pointerY - anchor.y;
      break;
    case "ne":
      y = pointerY;
      width = pointerX - anchor.x;
      height = bottom - pointerY;
      break;
    case "nw":
      x = pointerX;
      y = pointerY;
      width = right - pointerX;
      height = bottom - pointerY;
      break;
  }

  if (width < minSize) {
    if (handle === "sw" || handle === "nw") x = right - minSize;
    width = minSize;
  }

  if (height < minSize) {
    if (handle === "nw" || handle === "ne") y = bottom - minSize;
    height = minSize;
  }

  if (constrainSquare) {
    const size = Math.max(width, height, minSize);
    switch (handle) {
      case "se":
        width = size;
        height = size;
        break;
      case "nw":
        x = right - size;
        y = bottom - size;
        width = size;
        height = size;
        break;
      case "ne":
        y = bottom - size;
        width = size;
        height = size;
        break;
      case "sw":
        x = right - size;
        width = size;
        height = size;
        break;
    }
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

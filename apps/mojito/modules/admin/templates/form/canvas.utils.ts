import type { CanvasElement, TemplateMeta } from "./templateForm.types";
import {
  DEFAULT_IMAGE_PLACEHOLDER_FILL,
  DEFAULT_LINE_FILL,
  DEFAULT_SHAPE_FILL,
} from "./canvas.constants";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function appearanceStyle(el: CanvasElement): string {
  const opacity = (el.props.opacity ?? 100) / 100;
  return opacity < 1 ? `opacity:${opacity};` : "";
}

function baseStyle(el: CanvasElement): string {
  return `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;z-index:${el.zIndex};${appearanceStyle(el)}`;
}

function strokeCss(el: CanvasElement): string {
  const width = el.props.strokeWidth ?? 0;
  if (!el.props.stroke || width <= 0) return "border:none;";
  return `border:${width}px solid ${el.props.stroke};`;
}

function textStyle(el: CanvasElement): string {
  return `${baseStyle(el)}font-size:${el.props.fontSize ?? 32}px;font-family:${el.props.fontFamily ?? "inherit"};color:${el.props.fill ?? "#000000"};`;
}

function elementToHtml(el: CanvasElement, preview: boolean): string {
  switch (el.type) {
    case "dynamicText": {
      const dataKey = el.props.dataKey ?? slugify(el.purpose);
      const content = preview
        ? (el.props.text ?? `{{${dataKey}}}`)
        : `{{${dataKey}}}`;
      const radius = el.props.borderRadius
        ? `border-radius:${el.props.borderRadius}px;`
        : "";
      return `<div data-slot="${dataKey}" style="${textStyle(el)}${radius}">${content}</div>`;
    }
    case "text":
    case "staticText": {
      return `<div style="${textStyle(el)}">${el.props.text ?? ""}</div>`;
    }
    case "image": {
      const src = el.props.imageUrl || "";
      const radius = el.props.borderRadius
        ? `border-radius:${el.props.borderRadius}px;`
        : "";
      return `<img src="${src}" style="${baseStyle(el)}object-fit:cover;${strokeCss(el)}${radius}" alt="${el.purpose}" />`;
    }
    case "rectangle": {
      const radius = `border-radius:${el.props.borderRadius ?? 0}px;`;
      const style = `${baseStyle(el)}background:${el.props.fill ?? DEFAULT_SHAPE_FILL};${strokeCss(el)}${radius}`;
      return `<div style="${style}"></div>`;
    }
    case "circle": {
      const style = `${baseStyle(el)}background:${el.props.fill ?? DEFAULT_SHAPE_FILL};${strokeCss(el)}border-radius:50%;`;
      return `<div style="${style}"></div>`;
    }
    case "line": {
      const style = `${baseStyle(el)}background:${el.props.fill ?? el.props.stroke ?? DEFAULT_LINE_FILL};`;
      return `<div style="${style}"></div>`;
    }
    default:
      return "";
  }
}

export function serializeCanvas(
  meta: TemplateMeta,
  elements: CanvasElement[],
): string {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const children = sorted.map((el) => elementToHtml(el, false)).join("\n  ");
  return `<div style="position:relative;width:${meta.width}px;height:${meta.height}px;">\n  ${children}\n</div>`;
}

export function serializeCanvasPreview(
  meta: TemplateMeta,
  elements: CanvasElement[],
): string {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const children = sorted.map((el) => elementToHtml(el, true)).join("\n  ");
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;"><div style="position:relative;width:${meta.width}px;height:${meta.height}px;">\n  ${children}\n</div></body></html>`;
}

export function extractSlots(elements: CanvasElement[]) {
  return elements
    .filter((el) => el.type === "dynamicText")
    .map((el) => ({
      name: el.props.dataKey ?? slugify(el.purpose),
      type: "text" as const,
      label: el.purpose,
      required: false,
      placeholder: el.props.text,
    }));
}

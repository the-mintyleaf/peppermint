import type { CanvasElement, TemplateMeta } from "./templateForm.types";

function elementToHtml(el: CanvasElement, preview: boolean): string {
  const base = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;`;

  switch (el.kind) {
    case "slot": {
      const textStyle = `${base}font-size:${el.fontSize ?? 32}px;font-weight:${el.fontWeight ?? 400};color:${el.color ?? "#000000"};text-align:${el.textAlign ?? "left"};`;
      const content = preview ? (el.placeholder ?? `{{${el.slotName}}}`) : `{{${el.slotName}}}`;
      if (el.slotType === "image_url") {
        return `<img data-slot="${el.slotName}" src="${content}" style="${base}object-fit:cover;" alt="${el.label}" />`;
      }
      return `<div data-slot="${el.slotName}" style="${textStyle}">${content}</div>`;
    }
    case "rectangle": {
      const style = `${base}background:${el.fill};border-radius:${el.borderRadius}px;border:${el.borderWidth}px solid ${el.borderColor};`;
      return `<div style="${style}"></div>`;
    }
    case "divider": {
      const style = `${base}background:${el.color};height:${el.thickness}px;`;
      return `<div style="${style}"></div>`;
    }
    case "brand_logo": {
      return `<div style="${base}background:#000;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">LOGO</div>`;
    }
    case "text_static": {
      const style = `${base}font-size:${el.fontSize}px;font-weight:${el.fontWeight};color:${el.color};text-align:${el.textAlign};`;
      return `<div style="${style}">${el.content}</div>`;
    }
    default:
      return "";
  }
}

export function serializeCanvas(meta: TemplateMeta, elements: CanvasElement[]): string {
  const children = elements.map((el) => elementToHtml(el, false)).join("\n  ");
  return `<div style="position:relative;width:${meta.width}px;height:${meta.height}px;">\n  ${children}\n</div>`;
}

export function serializeCanvasPreview(meta: TemplateMeta, elements: CanvasElement[]): string {
  const children = elements.map((el) => elementToHtml(el, true)).join("\n  ");
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;"><div style="position:relative;width:${meta.width}px;height:${meta.height}px;">\n  ${children}\n</div></body></html>`;
}

export function extractSlots(elements: CanvasElement[]) {
  return elements
    .filter((el): el is Extract<CanvasElement, { kind: "slot" }> => el.kind === "slot")
    .map((el) => ({
      name: el.slotName,
      type: el.slotType,
      label: el.label,
      required: el.required,
      placeholder: el.placeholder,
      maxChars: el.maxChars,
    }));
}

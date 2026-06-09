import type { SlotType, PlatformFormat } from "../module.api";

export type ElementKind = "slot" | "rectangle" | "divider" | "brand_logo" | "text_static";

export interface BaseElement {
  id: string;
  kind: ElementKind;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SlotElement extends BaseElement {
  kind: "slot";
  slotName: string;
  slotType: SlotType;
  label: string;
  required: boolean;
  placeholder?: string;
  maxChars?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
}

export interface RectangleElement extends BaseElement {
  kind: "rectangle";
  fill: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
}

export interface DividerElement extends BaseElement {
  kind: "divider";
  color: string;
  thickness: number;
}

export interface BrandLogoElement extends BaseElement {
  kind: "brand_logo";
}

export interface TextStaticElement extends BaseElement {
  kind: "text_static";
  content: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: "left" | "center" | "right";
}

export type CanvasElement =
  | SlotElement
  | RectangleElement
  | DividerElement
  | BrandLogoElement
  | TextStaticElement;

// Distributive omit — correctly removes "id" from each union member
export type CanvasElementInput = CanvasElement extends infer T
  ? T extends { id: string }
    ? Omit<T, "id">
    : never
  : never;

export interface TemplateMeta {
  name: string;
  description: string;
  platform: PlatformFormat;
  width: number;
  height: number;
}

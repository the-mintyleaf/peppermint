import type { PlatformFormat } from "../module.api";

export type ElementType =
  | "text"
  | "image"
  | "rectangle"
  | "circle"
  | "line"
  | "dynamicText"
  | "staticText";

export type BuilderTool = "select" | ElementType;

export interface CanvasElementProps {
  text?: string;
  imageUrl?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  dataKey?: string;
  borderRadius?: number;
  opacity?: number;
}

export interface CanvasElement {
  id: string;
  purpose: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  props: CanvasElementProps;
}

export type CanvasElementInput = Omit<CanvasElement, "id">;

export interface TemplateMeta {
  name: string;
  description: string;
  platform: PlatformFormat;
  width: number;
  height: number;
}

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { BuilderTool, CanvasElement, CanvasElementInput, ElementType, TemplateMeta } from "./templateForm.types";
import type { PlatformFormat } from "../module.api";
import { PLATFORM_DIMENSIONS } from "../module.api";
import { createElementDefaults, createElementAtRect, generateElementPurpose } from "./elementDefaults";
import { DEFAULT_CANVAS_ZOOM, clampCanvasZoom, nextZoomIn, nextZoomOut } from "./canvas.constants";

const MAX_HISTORY = 50;

interface UpdateOptions {
  recordHistory?: boolean;
}

interface BuilderState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  activeTool: BuilderTool;
  history: CanvasElement[][];
  historyIndex: number;
  isDirty: boolean;
  templateMeta: TemplateMeta;
  previewMode: boolean;
  canvasZoom: number;

  initStore: (meta: TemplateMeta, elements: CanvasElement[]) => void;
  addElement: (element: CanvasElementInput) => void;
  addElementAtRect: (type: ElementType, x: number, y: number, width: number, height: number) => void;
  addElementAtCenter: (type: ElementType) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>, options?: UpdateOptions) => void;
  commitElementUpdate: (id: string, patch: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setActiveTool: (tool: BuilderTool) => void;
  reorderLayers: (orderedIds: string[]) => void;
  toggleVisible: (id: string) => void;
  toggleLocked: (id: string) => void;
  undo: () => void;
  redo: () => void;
  setTemplateMeta: (patch: Partial<TemplateMeta>) => void;
  setPlatform: (platform: PlatformFormat) => void;
  setPreviewMode: (on: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetCanvasZoom: () => void;
  setCanvasZoom: (zoom: number) => void;
  clearDirty: () => void;
}

function pushHistory(history: CanvasElement[][], index: number, snapshot: CanvasElement[]): {
  history: CanvasElement[][];
  historyIndex: number;
} {
  const truncated = history.slice(0, index + 1);
  const next = [...truncated, snapshot].slice(-MAX_HISTORY);
  return { history: next, historyIndex: next.length - 1 };
}

function getNextZIndex(elements: CanvasElement[]): number {
  if (elements.length === 0) return 0;
  return Math.max(...elements.map((el) => el.zIndex)) + 1;
}

function applyLayerOrder(elements: CanvasElement[], orderedIds: string[]): CanvasElement[] {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const count = orderedIds.length;
  const reordered = orderedIds.map((id, index) => {
    const el = byId.get(id);
    if (!el) throw new Error(`Unknown element id: ${id}`);
    return { ...el, zIndex: count - 1 - index };
  });
  const reorderedIds = new Set(orderedIds);
  const remaining = elements.filter((el) => !reorderedIds.has(el.id));
  return [...reordered, ...remaining];
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  elements: [],
  selectedElementId: null,
  activeTool: "select",
  history: [[]],
  historyIndex: 0,
  isDirty: false,
  previewMode: false,
  canvasZoom: DEFAULT_CANVAS_ZOOM,
  templateMeta: {
    name: "Untitled Template",
    description: "",
    platform: "instagram_square",
    width: 1080,
    height: 1080,
  },

  initStore(meta, elements) {
    set({
      elements,
      templateMeta: meta,
      history: [elements],
      historyIndex: 0,
      isDirty: false,
      selectedElementId: null,
      activeTool: "select",
      canvasZoom: DEFAULT_CANVAS_ZOOM,
    });
  },

  addElement(element) {
    const newEl = { ...element, id: uuidv4() } as CanvasElement;
    set((s) => {
      const next = [...s.elements, newEl];
      const h = pushHistory(s.history, s.historyIndex, next);
      return { elements: next, ...h, isDirty: true, selectedElementId: newEl.id };
    });
  },

  addElementAtRect(type, x, y, width, height) {
    const elements = get().elements;
    const zIndex = getNextZIndex(elements);
    const element = createElementAtRect(type, x, y, width, height, zIndex);
    element.purpose = generateElementPurpose(type, elements);
    get().addElement(element);
    set({ activeTool: "select" });
  },

  addElementAtCenter(type) {
    const { templateMeta, elements } = get();
    const zIndex = getNextZIndex(elements);
    const defaults = createElementDefaults(type, templateMeta.width, templateMeta.height, zIndex);
    defaults.purpose = generateElementPurpose(type, elements);
    get().addElement(defaults);
    set({ activeTool: "select" });
  },

  updateElement(id, patch, options = {}) {
    const { recordHistory = true } = options;
    set((s) => {
      const next = s.elements.map((el) => {
        if (el.id !== id) return el;
        const merged = { ...el, ...patch };
        if (patch.props) {
          merged.props = { ...el.props, ...patch.props };
        }
        return merged;
      });

      if (!recordHistory) {
        return { elements: next, isDirty: true };
      }

      const h = pushHistory(s.history, s.historyIndex, next);
      return { elements: next, ...h, isDirty: true };
    });
  },

  commitElementUpdate(id, patch) {
    set((s) => {
      const next = s.elements.map((el) => {
        if (el.id !== id) return el;
        const merged = { ...el, ...patch };
        if (patch.props) {
          merged.props = { ...el.props, ...patch.props };
        }
        return merged;
      });
      const h = pushHistory(s.history, s.historyIndex, next);
      return { elements: next, ...h, isDirty: true };
    });
  },

  removeElement(id) {
    set((s) => {
      const next = s.elements.filter((el) => el.id !== id);
      const h = pushHistory(s.history, s.historyIndex, next);
      return {
        elements: next,
        ...h,
        isDirty: true,
        selectedElementId: s.selectedElementId === id ? null : s.selectedElementId,
      };
    });
  },

  selectElement(id) {
    set({ selectedElementId: id });
  },

  setActiveTool(tool) {
    set({ activeTool: tool });
  },

  reorderLayers(orderedIds) {
    set((s) => {
      const next = applyLayerOrder(s.elements, orderedIds);
      const h = pushHistory(s.history, s.historyIndex, next);
      return { elements: next, ...h, isDirty: true };
    });
  },

  toggleVisible(id) {
    set((s) => {
      const next = s.elements.map((el) => (el.id === id ? { ...el, visible: !el.visible } : el));
      const h = pushHistory(s.history, s.historyIndex, next);
      return { elements: next, ...h, isDirty: true };
    });
  },

  toggleLocked(id) {
    set((s) => {
      const next = s.elements.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el));
      const h = pushHistory(s.history, s.historyIndex, next);
      return { elements: next, ...h, isDirty: true };
    });
  },

  undo() {
    set((s) => {
      if (s.historyIndex <= 0) return s;
      const newIndex = s.historyIndex - 1;
      return { elements: s.history[newIndex], historyIndex: newIndex, isDirty: true };
    });
  },

  redo() {
    set((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const newIndex = s.historyIndex + 1;
      return { elements: s.history[newIndex], historyIndex: newIndex, isDirty: true };
    });
  },

  setTemplateMeta(patch) {
    set((s) => ({ templateMeta: { ...s.templateMeta, ...patch }, isDirty: true }));
  },

  setPlatform(platform) {
    const dims = PLATFORM_DIMENSIONS[platform];
    set((s) => ({
      templateMeta: { ...s.templateMeta, platform, ...dims },
      isDirty: true,
    }));
  },

  setPreviewMode(on) {
    set({ previewMode: on });
  },

  zoomIn() {
    set((s) => ({ canvasZoom: nextZoomIn(s.canvasZoom) }));
  },

  zoomOut() {
    set((s) => ({ canvasZoom: nextZoomOut(s.canvasZoom) }));
  },

  resetCanvasZoom() {
    set({ canvasZoom: DEFAULT_CANVAS_ZOOM });
  },

  setCanvasZoom(zoom) {
    set({ canvasZoom: clampCanvasZoom(zoom) });
  },

  clearDirty() {
    set({ isDirty: false });
  },
}));

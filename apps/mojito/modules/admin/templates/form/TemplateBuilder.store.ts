import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { CanvasElement, CanvasElementInput, TemplateMeta } from "./templateForm.types";
import type { PlatformFormat } from "../module.api";
import { PLATFORM_DIMENSIONS } from "../module.api";

const MAX_HISTORY = 50;

interface BuilderState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  history: CanvasElement[][];
  historyIndex: number;
  isDirty: boolean;
  templateMeta: TemplateMeta;
  previewMode: boolean;

  // Actions
  initStore: (meta: TemplateMeta, elements: CanvasElement[]) => void;
  addElement: (element: CanvasElementInput) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  setTemplateMeta: (patch: Partial<TemplateMeta>) => void;
  setPlatform: (platform: PlatformFormat) => void;
  setPreviewMode: (on: boolean) => void;
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

export const useBuilderStore = create<BuilderState>((set, get) => ({
  elements: [],
  selectedElementId: null,
  history: [[]],
  historyIndex: 0,
  isDirty: false,
  previewMode: false,
  templateMeta: {
    name: "Untitled Template",
    description: "",
    platform: "instagram_square",
    width: 1080,
    height: 1080,
  },

  initStore(meta, elements) {
    set({ elements, templateMeta: meta, history: [elements], historyIndex: 0, isDirty: false, selectedElementId: null });
  },

  addElement(element) {
    const newEl = { ...element, id: uuidv4() } as CanvasElement;
    set((s) => {
      const next = [...s.elements, newEl];
      const h = pushHistory(s.history, s.historyIndex, next);
      return { elements: next, ...h, isDirty: true, selectedElementId: newEl.id };
    });
  },

  updateElement(id, patch) {
    set((s) => {
      const next = s.elements.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElement) : el));
      const h = pushHistory(s.history, s.historyIndex, next);
      return { elements: next, ...h, isDirty: true };
    });
  },

  removeElement(id) {
    set((s) => {
      const next = s.elements.filter((el) => el.id !== id);
      const h = pushHistory(s.history, s.historyIndex, next);
      return { elements: next, ...h, isDirty: true, selectedElementId: s.selectedElementId === id ? null : s.selectedElementId };
    });
  },

  selectElement(id) {
    set({ selectedElementId: id });
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

  clearDirty() {
    set({ isDirty: false });
  },
}));

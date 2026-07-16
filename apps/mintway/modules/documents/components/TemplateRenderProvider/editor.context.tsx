"use client";

// Re-export the canonical editor context so the document editor's provider and the copied
// templates (which import from "@/components/layout/editor/editor.context") share one context.
export {
  ContextEditor,
  type EditorState,
  type EditorHeaderProps,
} from "@/components/layout/editor/editor.context";

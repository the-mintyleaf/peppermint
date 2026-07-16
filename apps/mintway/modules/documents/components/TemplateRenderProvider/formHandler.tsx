"use client";

// Re-export the canonical FormHandler so the document editor's provider and the copied
// templates (which import from "@/components/framework/FormHandler") share one context.
export {
  FormHandler,
  type TemplateFormValues,
} from "@/components/framework/FormHandler";

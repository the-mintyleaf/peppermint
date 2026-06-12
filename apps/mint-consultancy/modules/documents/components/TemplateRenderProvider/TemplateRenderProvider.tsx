"use client";

import type { ReactNode } from "react";
import { FormHandler, type TemplateFormValues } from "./formHandler";
import { ContextEditor, type EditorState } from "./editor.context";

export interface TemplateContentShape extends Record<string, unknown> {
  details?: Record<string, unknown>;
  headerProps?: EditorState["headerProps"];
}

function splitContent(content: TemplateContentShape) {
  const { details, headerProps, ...formValues } = content;
  return {
    formValues: formValues as TemplateFormValues,
    editorState: {
      details: details ?? {},
      headerProps,
    },
  };
}

export function TemplateRenderProvider({
  content,
  children,
}: {
  content: TemplateContentShape;
  children: ReactNode;
}) {
  const { formValues, editorState } = splitContent(content);

  return (
    <ContextEditor.Provider state={editorState}>
      <FormHandler.Provider values={formValues}>{children}</FormHandler.Provider>
    </ContextEditor.Provider>
  );
}

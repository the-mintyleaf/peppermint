"use client";

import { createContext, type ReactNode } from "react";

/**
 * Read-only editor context for document templates. Templates consume
 * `useContext(ContextEditor.Context)` for `state.details` and `state.headerProps`
 * (header spacing / visibility toggles used by the print layout). The document editor
 * provides the state through `ContextEditor.Provider` (wired by `TemplateRenderProvider`).
 *
 * This is the single canonical instance — the module's
 * `TemplateRenderProvider/editor.context.tsx` re-exports it so the provider and the
 * templates share one context. `dispatch` is a no-op: templates render statically.
 */
export interface EditorHeaderProps {
  height: number;
  paddingBottom: number;
  enable: boolean;
  enableLine: boolean;
  // Index signature lets templates cast `headerProps` to a loose record (BankPaddingSpace);
  // named fields above keep their concrete types.
  [key: string]: unknown;
}

export interface EditorState {
  // Loosely typed: the copied templates read arbitrary derived keys off `details`
  // (e.g. bank statement rows). Typing each would require editing the templates.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: Record<string, any>;
  headerProps: EditorHeaderProps;
}

interface EditorContextValue {
  state: EditorState;
  dispatch: (action: unknown) => void;
}

const defaultState: EditorState = {
  details: {},
  headerProps: {
    height: 1,
    paddingBottom: 0.5,
    enable: false,
    enableLine: false,
  },
};

export const Context = createContext<EditorContextValue>({
  state: defaultState,
  dispatch: () => undefined,
});

function Provider({
  state,
  children,
}: {
  state?: Partial<EditorState>;
  children: ReactNode;
}) {
  const mergedState: EditorState = {
    ...defaultState,
    ...state,
    details: { ...defaultState.details, ...state?.details },
    headerProps: { ...defaultState.headerProps, ...state?.headerProps },
  };

  return (
    <Context.Provider value={{ state: mergedState, dispatch: () => undefined }}>
      {children}
    </Context.Provider>
  );
}

export const ContextEditor = {
  Context,
  Provider,
};

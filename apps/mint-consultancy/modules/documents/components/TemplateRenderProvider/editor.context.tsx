"use client";

import { createContext, type ReactNode } from "react";

export interface EditorHeaderProps {
  height?: number;
  paddingBottom?: number;
  enable?: boolean;
  enableLine?: boolean;
}

export interface EditorState {
  details: Record<string, unknown>;
  headerProps?: EditorHeaderProps;
}

interface EditorContextValue {
  state: EditorState;
  dispatch: (action: unknown) => void;
}

const defaultState: EditorState = {
  details: {},
  headerProps: { height: 1, paddingBottom: 0.5, enable: false, enableLine: false },
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

"use client";

import { createContext, useContext } from "react";
import type { ModalTableShellContextValue } from "./ModalTableShell.types";

export const ModalTableShellContext =
  createContext<ModalTableShellContextValue<any> | null>(null);
ModalTableShellContext.displayName = "ModalTableShellContext";

export function useModalTableShellContext<
  T extends object,
>(): ModalTableShellContextValue<T> {
  const ctx = useContext(ModalTableShellContext);
  if (!ctx)
    throw new Error(
      "useModalTableShellContext must be used inside <ModalTableShell>",
    );
  return ctx as ModalTableShellContextValue<T>;
}

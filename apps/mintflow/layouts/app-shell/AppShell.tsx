"use client";

import type { ReactNode } from "react";

import { Box } from "@peppermint/ui";

import { BottomNav, CreateTaskHost, IconRail } from "./components";
import classes from "./AppShell.module.css";

/**
 * The Kamban app shell: the shared navigation chrome wrapping every in-app
 * route. Desktop (≥ lg) shows the left icon rail; mobile shows the floating
 * bottom-nav pill. The Create Task sheet is hosted here so ＋ works from any
 * screen. Onboarding renders outside this shell.
 */
export function LayoutAppShell({ children }: { children: ReactNode }) {
  return (
    <Box className={classes.shell}>
      <IconRail />
      <main className={classes.main}>{children}</main>
      <BottomNav />
      <CreateTaskHost />
    </Box>
  );
}

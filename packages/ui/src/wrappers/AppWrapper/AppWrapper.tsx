"use client";

import React from "react";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClientWrapper } from "../QueryClientWrapper";
import type { AppWrapperProps } from "./AppWrapper.types";
import { NavigationProgress } from "@mantine/nprogress";

//mantine
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/spotlight/styles.css";

export function AppWrapper({
  theme,
  defaultColorScheme = "light",
  withQuery = false,
  children,
}: AppWrapperProps) {
  const content = (
    <MantineProvider theme={theme} defaultColorScheme={defaultColorScheme}>
      <ModalsProvider>
        <NavigationProgress />
        <Notifications />
        {children}
      </ModalsProvider>
    </MantineProvider>
  );

  return withQuery ? (
    <QueryClientWrapper>{content}</QueryClientWrapper>
  ) : (
    content
  );
}

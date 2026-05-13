"use client";

import React from "react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClientWrapper } from "../QueryClientWrapper";
import type { AppWrapperProps } from "./AppWrapper.types";

export function AppWrapper({
  theme,
  defaultColorScheme = "light",
  withQuery = false,
  children,
}: AppWrapperProps) {
  const content = (
    <MantineProvider theme={theme} defaultColorScheme={defaultColorScheme}>
      <ModalsProvider>
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

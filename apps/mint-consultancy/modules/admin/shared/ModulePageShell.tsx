"use client";

import { Box, ModuleHeader, Paper, Stack } from "@zetsel/ui";
import type { ReactNode } from "react";
import { buildBreadcrumbItems } from "./pageShell.utils";
import { ModulePageHeader, type ModulePageHeaderProps } from "./ModulePageHeader";

export interface ModulePageShellProps extends ModulePageHeaderProps {
  basePath: string;
  children: ReactNode;
}

export function ModulePageShell({
  basePath,
  children,
  ...headerProps
}: ModulePageShellProps) {
  return (
    <Paper
      p={0}
      withBorder
      radius="lg"
      h="calc(100vh - 16px)"
      style={{ overflow: "hidden" }}
    >
      <Stack gap={0} h="100%">
        <ModuleHeader breadcrumbItems={buildBreadcrumbItems(basePath)} />
        <Box px="md">
          <ModulePageHeader {...headerProps} basePath={basePath} />
        </Box>
        <Box px="md" pb="md" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {children}
        </Box>
      </Stack>
    </Paper>
  );
}

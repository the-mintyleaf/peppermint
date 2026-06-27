import type { MantineBreakpoint } from "@mantine/core";

export interface ManageHeaderProps {
  title: string;
  count?: number | string;
  description?: string;
  visibleFrom?: MantineBreakpoint;
}

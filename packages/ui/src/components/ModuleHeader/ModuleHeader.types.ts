import type { MantineColor } from "@mantine/core";
import type { ReactNode } from "react";

export interface ModuleHeaderBreadcrumbItem {
  label: string;
  href: string;
}

export interface ModuleHeaderProps {
  breadcrumbItems?: ModuleHeaderBreadcrumbItem[];
  breadcrumbColor?: MantineColor;
  center?: ReactNode;
  right?: ReactNode;
  withDivider?: boolean;
}

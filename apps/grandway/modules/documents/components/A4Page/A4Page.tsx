"use client";

import type { CSSProperties, ReactNode } from "react";
import { Paper } from "@peppermint/ui";
import { A4_DIMENSIONS } from "../../utils/templatePageProps";

interface A4PageProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  padding?: string | number;
}

export function A4Page({ children, style, className, padding }: A4PageProps) {
  return (
    <Paper
      data-print-page
      radius={0}
      shadow="sm"
      className={className}
      p={padding}
      style={{
        position: "relative",
        width: A4_DIMENSIONS.width,
        minHeight: A4_DIMENSIONS.minHeight,
        background: "#fff",
        color: "#1a1a1a",
        overflow: "hidden",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </Paper>
  );
}

"use client";

import { Paper } from "@peppermint/ui";
import { OrganizationBuilder } from "./OrganizationBuilder";

export function OrganizationBuilderPage() {
  return (
    <Paper
      p={0}
      withBorder
      radius="md"
      style={{ height: "calc(100vh - 16px)", overflow: "hidden", position: "relative" }}
    >
      <OrganizationBuilder />
    </Paper>
  );
}

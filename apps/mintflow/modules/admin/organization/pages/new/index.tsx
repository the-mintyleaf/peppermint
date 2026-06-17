"use client";

import { Paper } from "@peppermint/ui";
import { OrgUnitForm } from "../../form";

export function OrgUnitNew() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <OrgUnitForm onBack={() => history.back()} />
    </Paper>
  );
}

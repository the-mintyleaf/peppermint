"use client";

import { useParams } from "next/navigation";
import { Paper } from "@peppermint/ui";
import { OrgUnitView } from "./OrgUnitView";

export function OrgUnitViewPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <OrgUnitView orgUnitId={id} />
    </Paper>
  );
}

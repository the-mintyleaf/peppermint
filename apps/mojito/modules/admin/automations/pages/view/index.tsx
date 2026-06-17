"use client";

import { useParams } from "next/navigation";
import { Paper, ScrollArea } from "@peppermint/ui";
import { AutomationView } from "./AutomationView";

export function AutomationPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)" style={{ overflow: "hidden" }}>
      <ScrollArea h="100%" p="lg">
        <AutomationView automationId={id} />
      </ScrollArea>
    </Paper>
  );
}

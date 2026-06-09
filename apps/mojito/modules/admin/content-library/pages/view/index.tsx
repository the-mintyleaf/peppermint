"use client";

import { useParams } from "next/navigation";
import { Paper, ScrollArea } from "@zetsel/ui";
import { ContentItemView } from "./ContentItemView";

export function ContentLibraryView() {
  const { id } = useParams<{ id: string }>();

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)" style={{ overflow: "hidden" }}>
      <ScrollArea h="100%" p="lg">
        <ContentItemView contentId={id} />
      </ScrollArea>
    </Paper>
  );
}

"use client";

import { Paper, Stack, Text, Title, Divider } from "@zetsel/ui";
import type { DocumentTemplateProps, WodaContent } from "../../documents.types";

export function WodaTemplate({
  document,
  historicalSnapshot,
  isHistorical,
}: DocumentTemplateProps) {
  const content = (historicalSnapshot?.content ?? document.content) as WodaContent;

  return (
    <Paper
      shadow="sm"
      p="xl"
      maw={700}
      w="100%"
      style={{ background: "#fff", color: "#1a1a1a" }}
    >
      <Stack gap="md">
        {isHistorical && (
          <Text size="xs" c="dimmed">
            Historical snapshot
          </Text>
        )}
        <Title order={3}>{content.title}</Title>
        {content.documentNumber && (
          <Text size="sm" c="dimmed">
            Ref: {content.documentNumber}
          </Text>
        )}
        <Divider />
        <Text size="sm">
          <strong>To:</strong> {content.recipient}
        </Text>
        <Text size="sm">
          <strong>Date:</strong> {content.issueDate}
        </Text>
        <Divider />
        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
          {content.body || "—"}
        </Text>
      </Stack>
    </Paper>
  );
}

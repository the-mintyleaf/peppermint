"use client";

import { Paper, Stack, Text, Title, Divider } from "@zetsel/ui";
import type { DocumentTemplateProps, CvContent } from "../../documents.types";

export function CvTemplate({
  document,
  studentFullData,
  historicalSnapshot,
  isHistorical,
}: DocumentTemplateProps) {
  const content = (historicalSnapshot?.content ?? document.content) as CvContent;
  const student = studentFullData;

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
        <Title order={2}>{student?.fullName ?? "Student CV"}</Title>
        <Text size="sm" c="dimmed">
          {student?.email} · {student?.phone}
        </Text>
        <Divider />
        <Stack gap="xs">
          <Text fw={600}>Summary</Text>
          <Text size="sm">{content.summary || "—"}</Text>
        </Stack>
        <Stack gap="xs">
          <Text fw={600}>Skills</Text>
          <Text size="sm">{content.skills || "—"}</Text>
        </Stack>
        <Stack gap="xs">
          <Text fw={600}>Experience</Text>
          <Text size="sm">{content.experience || "—"}</Text>
        </Stack>
        <Divider />
        <Text size="sm">
          <strong>Program:</strong> {student?.program ?? "—"}
        </Text>
        <Text size="sm">
          <strong>Nationality:</strong> {student?.nationality ?? "—"}
        </Text>
      </Stack>
    </Paper>
  );
}

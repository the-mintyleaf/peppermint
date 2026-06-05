"use client";

import { Paper, Stack, Text, Title, Group, Divider } from "@zetsel/ui";
import type { DocumentTemplateProps, CertificateContent } from "../../documents.types";

export function CertificateTemplate({
  document,
  signatures = [],
  historicalSnapshot,
  isHistorical,
}: DocumentTemplateProps) {
  const content = (historicalSnapshot?.content ?? document.content) as CertificateContent;

  const instructor = signatures.find((s) => s.id === content.instructorId);
  const director = signatures.find((s) => s.id === content.directorId);

  const studyLabel =
    content.studyType === 0 ? "Currently Studying (履修している)" : "Completed (履修した)";

  return (
    <Paper
      shadow="sm"
      p="xl"
      maw={700}
      w="100%"
      style={{ background: "#fff", color: "#1a1a1a" }}
    >
      <Stack gap="lg" align="center">
        {isHistorical && (
          <Text size="xs" c="dimmed">
            Historical snapshot
          </Text>
        )}
        <Title order={2} ta="center">
          Certificate of Enrollment
        </Title>
        <Divider w="100%" />
        <Stack gap="sm" w="100%">
          <Text>
            This is to certify that <strong>{content.studentName}</strong>, a national of{" "}
            <strong>{content.nationality}</strong>, is enrolled in the{" "}
            <strong>{content.program}</strong> program.
          </Text>
          <Text>
            Study status: <strong>{studyLabel}</strong>
          </Text>
          <Text>
            Issue date: <strong>{content.issueDate}</strong>
          </Text>
        </Stack>
        <Group justify="space-between" w="100%" mt="xl">
          <Stack gap={4} align="center">
            <Text size="sm" fw={500}>
              {instructor?.name ?? "—"}
            </Text>
            <Text size="xs" c="dimmed">
              Instructor
            </Text>
          </Stack>
          <Stack gap={4} align="center">
            <Text size="sm" fw={500}>
              {director?.name ?? "—"}
            </Text>
            <Text size="xs" c="dimmed">
              Managing Director
            </Text>
          </Stack>
        </Group>
      </Stack>
    </Paper>
  );
}

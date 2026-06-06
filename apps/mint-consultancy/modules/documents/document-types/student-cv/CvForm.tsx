"use client";

import { Stack, Button, Text } from "@zetsel/ui";
import type { DocumentFormProps, CvContent } from "../../documents.types";

export function CvForm({ studentFullData, onSubmit, isLoading }: DocumentFormProps) {
  const handleCreate = () => {
    const content: CvContent = {
      summary: studentFullData?.summary ?? "",
      skills: studentFullData?.skills ?? "",
      experience: studentFullData?.experience ?? "",
    };
    onSubmit(content);
  };

  return (
    <Stack gap="md" p="md">
      <Text size="sm" c="dimmed">
        A CV will be generated from {studentFullData?.fullName ?? "the student"}&apos;s profile
        data. You can edit the content after creation.
      </Text>
      <Button onClick={handleCreate} loading={isLoading} fullWidth>
        Create CV
      </Button>
    </Stack>
  );
}

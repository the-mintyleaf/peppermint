"use client";

import { Center, Stack, Text, Button, SimpleGrid, Loader } from "@zetsel/ui";
import { useDocumentEditor } from "../../context";
import { documentTypeList } from "../../documentTypeConfig";

export function EmptyState() {
  const { studentId, isLoadingDocuments, openCreateModal } = useDocumentEditor();

  if (isLoadingDocuments) {
    return (
      <Center py="xl">
        <Loader size="xs" aria-label="Loading documents" />
      </Center>
    );
  }

  const availableTypes = documentTypeList.filter((config) => {
    if (config.requiresStudent && !studentId) return false;
    return true;
  });

  return (
    <Center py="xl">
      <Stack align="center" gap="sm" maw={360}>
        <Text size="xs" c="dimmed" ta="center">
          {studentId
            ? "No pages yet. Create your first document."
            : "Select or create a document to begin."}
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={6} w="100%">
          {availableTypes.map((config) => (
            <Button
              key={config.type}
              variant="light"
              size="xs"
              onClick={() => openCreateModal(config.type)}
            >
              Create {config.label}
            </Button>
          ))}
        </SimpleGrid>
      </Stack>
    </Center>
  );
}

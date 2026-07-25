"use client";

import { Center, Stack, Text, Button, Loader } from "@peppermint/ui";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useDocumentEditor } from "../../context";
import { AddPageMenu } from "../AddPageMenu";
import { getAvailableDocumentTypes } from "../../utils/documentTypeMenu";

export function EmptyState() {
  const { applicantId, documents, isLoadingDocuments, isCreatingDocument } =
    useDocumentEditor();

  if (isLoadingDocuments) {
    return (
      <Center py="xl">
        <Loader size="xs" aria-label="Loading documents" />
      </Center>
    );
  }

  const availableTypes = getAvailableDocumentTypes(applicantId, documents);

  return (
    <Center py="xl">
      <Stack align="center" gap="sm" maw={360}>
        <Text size="xs" c="dimmed" ta="center">
          {applicantId
            ? "No pages yet. Create your first document."
            : "Select or create a document to begin."}
        </Text>
        {availableTypes.length > 0 && (
          <AddPageMenu width={240}>
            <Button
              variant="light"
              size="xs"
              leftSection={<PlusIcon size={14} />}
              loading={isCreatingDocument}
            >
              Add page
            </Button>
          </AddPageMenu>
        )}
      </Stack>
    </Center>
  );
}

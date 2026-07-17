"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  useQuery,
} from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { fetchApplicants } from "@/modules/admin/applicant/_shared/applicant.api";
import type { NewDocumentModalProps } from "./NewDocumentModal.types";

/**
 * Applicant picker for starting a document workspace. Documents are authored per applicant,
 * so "new" is really "choose an applicant, then open their full-screen editor" — this modal
 * replaces the old standalone `/documents/new` page.
 */
export function NewDocumentModal({ opened, onClose }: NewDocumentModalProps) {
  const router = useRouter();
  const [applicantId, setApplicantId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "documents", "new", "applicants"],
    queryFn: () =>
      fetchApplicants({
        page: 1,
        pageSize: 100,
        search: "",
        sort: [],
        filters: {},
      }),
    enabled: opened,
  });

  const applicants = data?.data ?? [];
  const applicantOptions = applicants.map((applicant) => ({
    value: applicant.id,
    label: applicant.applicant_code
      ? `${applicant.full_name} · ${applicant.applicant_code}`
      : applicant.full_name,
  }));

  const handleClose = () => {
    setApplicantId(null);
    onClose();
  };

  const handleContinue = () => {
    if (!applicantId) return;
    router.push(`/documents/${applicantId}`);
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="New document" centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Select an applicant to open their document workspace.
        </Text>

        {isError ? (
          <Alert
            variant="light"
            color="red"
            icon={<WarningIcon size={16} />}
            title="Couldn't load applicants"
          >
            <Group justify="space-between" align="center">
              <Text size="sm">Please try again.</Text>
              <Button size="xs" variant="light" onClick={() => refetch()}>
                Retry
              </Button>
            </Group>
          </Alert>
        ) : (
          <Select
            label="Applicant"
            placeholder={
              isLoading ? "Loading applicants…" : "Choose an applicant"
            }
            data={applicantOptions}
            value={applicantId}
            onChange={setApplicantId}
            searchable
            nothingFoundMessage="No applicants found"
            disabled={isLoading || applicantOptions.length === 0}
          />
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={!applicantId} onClick={handleContinue}>
            Open workspace
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

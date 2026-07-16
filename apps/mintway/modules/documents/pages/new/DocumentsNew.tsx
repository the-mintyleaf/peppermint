"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Divider,
  Group,
  PageBreadcrumb,
  Paper,
  Select,
  Stack,
  Text,
  useQuery,
} from "@peppermint/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { fetchApplicants } from "@/modules/admin/applicant/_shared/applicant.api";

const breadcrumbItems = [
  { label: "Documents", href: "/documents" },
  { label: "New", href: "/documents/new" },
];

export function DocumentsNew() {
  const router = useRouter();
  const [applicantId, setApplicantId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["documents", "new", "applicants"],
    queryFn: () =>
      fetchApplicants({
        page: 1,
        pageSize: 100,
        search: "",
        sort: [],
        filters: {},
      }),
  });

  const applicants = data?.data ?? [];
  const applicantOptions = applicants.map((applicant) => ({
    value: applicant.id,
    label: applicant.applicant_code
      ? `${applicant.full_name} · ${applicant.applicant_code}`
      : applicant.full_name,
  }));

  const handleContinue = () => {
    if (!applicantId) return;
    router.push(`/documents/${applicantId}`);
  };

  return (
    <>
      <Group pl="md" h={38} justify="space-between">
        <PageBreadcrumb items={breadcrumbItems} />
      </Group>
      <Divider />
      <Box px="md" py="md">
        <Stack gap="md" maw={480}>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<ArrowLeftIcon size={14} />}
            onClick={() => router.push("/documents")}
            w="fit-content"
          >
            Back to documents
          </Button>

          <div>
            <Text size="2rem" fw={400}>
              New Document
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Select an applicant to open their document workspace.
            </Text>
          </div>

          <Paper withBorder p="md">
            <Stack gap="md">
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

              <Group justify="flex-end">
                <Button
                  size="xs"
                  disabled={!applicantId}
                  onClick={handleContinue}
                >
                  Open workspace
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </>
  );
}

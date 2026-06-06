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
} from "@zetsel/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { fetchStudents } from "@/modules/students/students.api";
import { studentQueryKeys } from "@/modules/students/students.queryKeys";

const breadcrumbItems = [
  { label: "Admin", href: "/admin" },
  { label: "Documents", href: "/admin/documents" },
  { label: "New", href: "/admin/documents/new" },
];

export function DocumentsNew() {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [studentQueryKeys.list(), "documents-new"],
    queryFn: () => fetchStudents({ page: 1, pageSize: 100 }),
  });

  const students = data?.data ?? [];
  const studentOptions = students.map((student) => ({
    value: student.id,
    label: student.fullName,
  }));

  const handleContinue = () => {
    if (!studentId) return;
    router.push(`/documents/${studentId}`);
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
          onClick={() => router.push("/admin/documents")}
          w="fit-content"
        >
          Back to documents
        </Button>

        <div>
          <Text size="2rem" fw={400}>
            New Document
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Select a student to open their document workspace.
          </Text>
        </div>

        <Paper withBorder p="md">
          <Stack gap="md">
            <Select
              label="Student"
              placeholder={isLoading ? "Loading students..." : "Choose a student"}
              data={studentOptions}
              value={studentId}
              onChange={setStudentId}
              searchable
              nothingFoundMessage="No students found"
              disabled={isLoading || studentOptions.length === 0}
            />

            <Group justify="flex-end">
              <Button
                size="xs"
                disabled={!studentId}
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

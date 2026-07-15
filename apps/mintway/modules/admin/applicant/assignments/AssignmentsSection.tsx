"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Group,
  Loader,
  ModalPaper,
  Stack,
  Table,
  Text,
  Title,
  dayjs,
  useQuery,
} from "@peppermint/ui";
import { openReasonConfirmModal } from "@peppermint/admin";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";

import { assignmentKeys, useApplicantMutation } from "../_shared";
import type { Assignment } from "../_shared";
import { AssignAssignmentModal } from "./AssignAssignmentModal";
import { endAssignment, fetchAssignments } from "./assignments.api";

function fmtDateTime(value?: string | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : "—";
}

/**
 * Assignment history for the applicant (§11): assign a counsellor and end the current
 * assignment. Assignments are history rows — ending sets `ended_at`, never deletes.
 */
export function AssignmentsSection({ applicantId }: { applicantId: string }) {
  const [assignOpen, setAssignOpen] = useState(false);

  const query = useQuery({
    queryKey: assignmentKeys.list(applicantId),
    queryFn: () =>
      fetchAssignments(applicantId, {
        page: 1,
        pageSize: 100,
        search: "",
        sort: [],
        filters: {},
      }).then((res) => res.data),
    retry: false,
  });

  const end = useApplicantMutation<void, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => endAssignment(applicantId, id, reason),
    successTitle: "Assignment ended",
    successMessage: "The assignment was ended.",
    errorTitle: "Couldn't end assignment",
    invalidateKeys: [assignmentKeys.list(applicantId)],
  });

  const confirmEnd = (assignment: Assignment) =>
    openReasonConfirmModal({
      title: "End assignment",
      description: "End this assignment? A reason is optional.",
      reasonRequired: false,
      confirmLabel: "End",
      onConfirm: async (reason) => {
        await end.mutateAsync({ id: assignment.id, reason });
      },
    });

  const rows = query.data ?? [];

  return (
    <ModalPaper withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={6}>Assignments</Title>
          <Button
            size="xs"
            variant="default"
            leftSection={<UserPlusIcon size={14} />}
            onClick={() => setAssignOpen(true)}
          >
            Assign
          </Button>
        </Group>

        {query.isLoading ? (
          <Group justify="center" py="lg">
            <Loader size="sm" />
          </Group>
        ) : rows.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="lg">
            No assignments yet.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Counsellor</Table.Th>
                <Table.Th>Scope</Table.Th>
                <Table.Th>Assigned</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((a) => (
                <Table.Tr key={a.id}>
                  <Table.Td>
                    <Text size="xs">{a.assigned_to}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">
                      {a.application_case ? "Case" : "Applicant-wide"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{fmtDateTime(a.assigned_at)}</Text>
                  </Table.Td>
                  <Table.Td>
                    {a.is_current ? (
                      <Badge variant="light" color="teal">
                        Current
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">
                        Ended {fmtDateTime(a.ended_at)}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {a.is_current && (
                      <Button
                        size="compact-xs"
                        variant="subtle"
                        color="red"
                        onClick={() => confirmEnd(a)}
                      >
                        End
                      </Button>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>

      <AssignAssignmentModal
        applicantId={applicantId}
        opened={assignOpen}
        onClose={() => setAssignOpen(false)}
      />
    </ModalPaper>
  );
}

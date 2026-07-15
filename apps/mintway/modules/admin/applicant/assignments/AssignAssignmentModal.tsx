"use client";

import { useState } from "react";
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  useDebouncedValue,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";

import { fetchUsers } from "@/modules/admin/authenticate/users/users.api";
import { assignmentKeys, caseKeys, useApplicantMutation } from "../_shared";
import type { Assignment } from "../_shared";
import { fetchCases } from "../cases/cases.api";
import {
  createAssignment,
  type AssignmentCreatePayload,
} from "./assignments.api";

interface AssignAssignmentModalProps {
  applicantId: string;
  opened: boolean;
  onClose: () => void;
}

function userLabel(p: {
  first_name: string;
  last_name: string;
  preferred_name: string;
  employee_code: string;
}): string {
  return (
    [p.preferred_name || p.first_name, p.last_name].filter(Boolean).join(" ") ||
    p.employee_code
  );
}

/**
 * Assign the applicant (optionally scoped to a case) to a counsellor (§11.1). The
 * assignee is searched from the accounts directory; a new assignment ends the prior
 * current one at the same scope server-side.
 */
export function AssignAssignmentModal({
  applicantId,
  opened,
  onClose,
}: AssignAssignmentModalProps) {
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [caseId, setCaseId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: ["assignment-user-search", debouncedSearch],
    queryFn: () =>
      fetchUsers({
        page: 1,
        pageSize: 20,
        search: debouncedSearch,
        sort: [],
        // The assignee must be an active account (APPLICANT_ASSIGNEE_INVALID), so
        // don't offer suspended/deactivated users in the picker.
        filters: { status: "active" },
      }),
    enabled: opened && debouncedSearch.trim().length > 0,
  });

  const cases = useQuery({
    queryKey: ["assignment-case-options", applicantId],
    queryFn: () =>
      fetchCases(applicantId, {
        page: 1,
        pageSize: 100,
        search: "",
        sort: [],
        filters: {},
      }),
    enabled: opened,
  });

  const userOptions = (users.data?.data ?? [])
    .filter((u) => u.account_status === "active")
    .map((u) => ({
      value: u.id,
      label: `${userLabel(u.employee_profile)} · @${u.username}`,
    }));
  const caseOptions = (cases.data?.data ?? []).map((c) => ({
    value: c.id,
    label: `${c.case_code}${c.destination_country ? ` · ${c.destination_country}` : ""}`,
  }));

  const reset = () => {
    setAssignedTo(null);
    setSearch("");
    setCaseId(null);
    setReason("");
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  const mutation = useApplicantMutation<Assignment, AssignmentCreatePayload>({
    mutationFn: (body) => createAssignment(applicantId, body),
    successTitle: "Applicant assigned",
    successMessage: "The counsellor was assigned.",
    errorTitle: "Couldn't assign",
    invalidateKeys: [assignmentKeys.list(applicantId)],
    onSuccess: (_data, variables) => {
      // A case-scoped assignment sets ApplicationCase.assigned_counsellor and bumps its
      // record_version, so refresh the case caches too (§11.1).
      if (variables.application_case_id) {
        void queryClient.invalidateQueries({
          queryKey: caseKeys.detail(variables.application_case_id),
        });
        void queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
      }
      handleClose();
    },
  });

  const handleSubmit = () => {
    if (!assignedTo) return;
    mutation.mutate({
      assigned_to: assignedTo,
      ...(caseId ? { application_case_id: caseId } : {}),
      ...(reason.trim() ? { reason: reason.trim() } : {}),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Assign counsellor"
      centered
    >
      <Stack gap="sm">
        <Select
          label="Counsellor"
          placeholder="Search by name or username"
          searchable
          data={userOptions}
          value={assignedTo}
          onChange={setAssignedTo}
          searchValue={search}
          onSearchChange={setSearch}
          nothingFoundMessage={
            debouncedSearch.trim() && !users.isFetching
              ? "No matches"
              : undefined
          }
        />
        <Select
          label="Case (optional)"
          placeholder="Applicant-wide"
          clearable
          data={caseOptions}
          value={caseId}
          onChange={setCaseId}
        />
        <Textarea
          label="Reason (optional)"
          autosize
          minRows={2}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
        />
        <Group justify="flex-end" gap="xs">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={mutation.isPending}
            disabled={!assignedTo}
          >
            Assign
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  useDebouncedValue,
  useQuery,
} from "@peppermint/ui";

import {
  applicantKeys,
  fetchApplicants,
  mergeApplicant,
  useApplicantMutation,
} from "../../../_shared";
import type {
  ApplicantActionTarget,
  MergePayload,
  MergeRecord,
} from "../../../_shared";

interface MergeModalProps {
  /** The duplicate being folded into a survivor. */
  applicant: ApplicantActionTarget;
  opened: boolean;
  onClose: () => void;
}

/**
 * The whitelisted scalar fields that may be pulled from the duplicate onto the
 * survivor: names, contact, DOB, gender, nationality, religion, summaries,
 * `lead_source*` and `initial_interest`. Anything omitted here simply cannot be
 * rescued from the duplicate before it is archived, so the list must stay complete.
 */
const RESOLVABLE_FIELDS: { value: string; label: string }[] = [
  { value: "first_name", label: "First name" },
  { value: "middle_name", label: "Middle name" },
  { value: "last_name", label: "Last name" },
  { value: "name_native", label: "Native name" },
  { value: "preferred_display_name", label: "Preferred display name" },
  { value: "primary_email", label: "Primary email" },
  { value: "alternate_email", label: "Alternate email" },
  { value: "primary_phone", label: "Primary phone" },
  { value: "alternate_phone", label: "Alternate phone" },
  { value: "date_of_birth", label: "Date of birth" },
  { value: "gender", label: "Gender" },
  { value: "nationality", label: "Nationality" },
  { value: "religion", label: "Religion" },
  { value: "summary", label: "Summary" },
  { value: "eligibility_summary", label: "Eligibility summary" },
  { value: "counselling_notes", label: "Counselling notes" },
  { value: "lead_source", label: "Lead source" },
  { value: "lead_source_detail", label: "Lead source detail" },
  { value: "initial_interest", label: "Initial interest" },
];

/**
 * Fold this (duplicate) applicant into a surviving applicant. The survivor is picked
 * by search; a reason is mandatory; `field_resolutions` chooses which scalar fields to
 * copy from the duplicate. On success the duplicate is archived (retained) and we route
 * to the survivor.
 */
export function MergeModal({ applicant, opened, onClose }: MergeModalProps) {
  const router = useRouter();
  const [survivingId, setSurvivingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const candidates = useQuery({
    queryKey: [...applicantKeys.lists(), "merge-search", debouncedSearch],
    queryFn: () =>
      fetchApplicants({
        page: 1,
        pageSize: 20,
        search: debouncedSearch,
        sort: [],
        filters: {},
      }),
    enabled: opened && debouncedSearch.trim().length > 0,
  });

  const options = (candidates.data?.data ?? [])
    .filter((a) => a.id !== applicant.id)
    .map((a) => ({
      value: a.id,
      label: `${a.full_name} · ${a.applicant_code}`,
    }));

  const reset = () => {
    setSurvivingId(null);
    setSearch("");
    setReason("");
    setFields([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const mutation = useApplicantMutation<
    {
      data: { surviving_applicant: ApplicantActionTarget; merge: MergeRecord };
    },
    MergePayload
  >({
    mutationFn: (payload) => mergeApplicant(applicant.id, payload),
    successTitle: "Applicants merged",
    successMessage: "The duplicate was folded into the surviving applicant.",
    errorTitle: "Couldn't merge applicants",
    invalidateKeys: [applicantKeys.all],
    onSuccess: (result) => {
      const survivor = result.data.surviving_applicant;
      handleClose();
      if (survivor?.id) router.push(`/admin/applicants/${survivor.id}`);
    },
  });

  const disabled = !survivingId || !reason.trim();

  const handleSubmit = () => {
    if (!survivingId) return;
    const field_resolutions = fields.reduce<Record<string, "duplicate">>(
      (acc, f) => {
        acc[f] = "duplicate";
        return acc;
      },
      {},
    );
    mutation.mutate({
      surviving_applicant_id: survivingId,
      reason: reason.trim(),
      ...(fields.length ? { field_resolutions } : {}),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Merge into another applicant"
      centered
      size="lg"
      styles={{ body: { padding: "var(--mantine-spacing-md)" } }}
    >
      <Stack gap="sm">
        <Alert color="orange" variant="light" py="xs">
          <Text size="xs">
            <strong>{applicant.full_name}</strong> ({applicant.applicant_code})
            will be archived and folded into the applicant you choose. This
            can&apos;t be undone.
          </Text>
        </Alert>

        <Select
          label="Surviving applicant"
          placeholder="Search by name, code, email, or phone"
          searchable
          data={options}
          value={survivingId}
          onChange={setSurvivingId}
          searchValue={search}
          onSearchChange={setSearch}
          nothingFoundMessage={
            debouncedSearch.trim() && !candidates.isFetching
              ? "No matches"
              : undefined
          }
        />

        <Textarea
          label="Reason"
          required
          autosize
          minRows={2}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
        />

        <Checkbox.Group
          label="Copy these fields from the duplicate"
          description="Optional — unchecked fields keep the survivor's values."
          value={fields}
          onChange={setFields}
        >
          <Group gap="xs" mt="xs">
            {RESOLVABLE_FIELDS.map((f) => (
              <Checkbox key={f.value} value={f.value} label={f.label} />
            ))}
          </Group>
        </Checkbox.Group>

        <Group justify="flex-end" gap="xs">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleSubmit}
            loading={mutation.isPending}
            disabled={disabled}
          >
            Merge
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

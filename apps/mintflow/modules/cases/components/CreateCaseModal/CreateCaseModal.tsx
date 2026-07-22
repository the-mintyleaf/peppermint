"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Button,
  Collapse,
  DatePickerInput,
  Divider,
  Group,
  Modal,
  modals,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
  useDisclosure,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { z } from "zod";

import {
  CREATABLE_VISIBILITY_MODES,
  getWorkErrorMessage,
  SENSITIVITY_LEVEL,
  VISIBILITY_MODE_LABEL,
  WORK_PRIORITY,
  WORK_PRIORITY_LABEL,
} from "@/lib/work";
import { useCreateWork } from "../../cases.mutations";
import type { CreateWorkPayload } from "../../cases.commands";
import {
  useAssignableUserOptions,
  useOrganizationOptions,
  useUnitOptions,
} from "./CreateCaseModal.hooks";
import type {
  CreateCaseFormValues,
  CreateCaseModalProps,
} from "./CreateCaseModal.types";

const PRIORITY_OPTIONS = WORK_PRIORITY.map((p) => ({
  value: p,
  label: WORK_PRIORITY_LABEL[p],
}));

const VISIBILITY_OPTIONS = CREATABLE_VISIBILITY_MODES.map((m) => ({
  value: m,
  label: VISIBILITY_MODE_LABEL[m],
}));

const SENSITIVITY_LABEL: Record<(typeof SENSITIVITY_LEVEL)[number], string> = {
  normal: "Normal",
  restricted: "Restricted",
  confidential: "Confidential",
};
const SENSITIVITY_OPTIONS = SENSITIVITY_LEVEL.map((s) => ({
  value: s,
  label: SENSITIVITY_LABEL[s],
}));

const OWNER_MODE_OPTIONS = [
  { value: "self", label: "I'll own it" },
  { value: "actor", label: "Assign to someone" },
  { value: "unit", label: "Route to a unit" },
];

const schema = z
  .object({
    title_np: z.string().trim().min(1, "A Nepali title is required"),
    title_en: z.string(),
    objective: z.string().trim().min(1, "An objective is required"),
    description: z.string(),
    organization: z.string().min(1, "Select an organization"),
    responsible_unit: z.string().min(1, "Select a responsible unit"),
    priority: z.enum(WORK_PRIORITY),
    due_at: z.string().nullable(),
    review_required: z.boolean(),
    owner_mode: z.enum(["self", "actor", "unit"]),
    proposed_owner: z.string().nullable(),
    target_unit: z.string().nullable(),
    visibility_mode: z.enum(["organizational", "participants_only"]),
    sensitivity_level: z.enum(SENSITIVITY_LEVEL),
  })
  .superRefine((v, ctx) => {
    if (v.owner_mode === "actor" && !v.proposed_owner)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["proposed_owner"],
        message: "Choose who will own this case",
      });
    if (v.owner_mode === "unit" && !v.target_unit)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["target_unit"],
        message: "Choose a unit to route to",
      });
  });

const INITIAL: CreateCaseFormValues = {
  title_np: "",
  title_en: "",
  objective: "",
  description: "",
  organization: "",
  responsible_unit: "",
  priority: "normal",
  due_at: null,
  review_required: false,
  owner_mode: "self",
  proposed_owner: null,
  target_unit: null,
  visibility_mode: "organizational",
  sensitivity_level: "normal",
};

/** A date-only picker value → an ISO datetime the backend's DateTimeField accepts. */
function toIsoDateTime(value: string | null): string | undefined {
  if (!value) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value;
}

export function CreateCaseModal({ opened, onClose }: CreateCaseModalProps) {
  const create = useCreateWork();

  // Mirrors the form's dirty state so the close guard (which lives outside the
  // FormWrapper context) can read it synchronously.
  const dirtyRef = useRef(false);

  // One key per open session, so a retried submit is idempotent but a fresh
  // open (a genuinely new case) gets a new key.
  const idempotencyKey = useMemo(
    () => (opened ? crypto.randomUUID() : ""),
    [opened],
  );

  // Guard every close path (X button, escape, Cancel) against discarding
  // unsaved input. `styles.inner` restores padding — confirm modals render
  // edge-to-edge under the app's global Modal body-padding override.
  const requestClose = useCallback(() => {
    if (!dirtyRef.current) {
      onClose();
      return;
    }
    modals.openConfirmModal({
      title: "Discard this case?",
      centered: true,
      children: (
        <Text size="sm">
          You have unsaved changes. Closing now will discard them.
        </Text>
      ),
      labels: { confirm: "Discard", cancel: "Keep editing" },
      confirmProps: { color: "red" },
      styles: { inner: { padding: "1rem" } },
      onConfirm: onClose,
    });
  }, [onClose]);

  async function submit(values: CreateCaseFormValues) {
    const payload: CreateWorkPayload = {
      organization: values.organization,
      responsible_unit: values.responsible_unit,
      title_np: values.title_np.trim(),
      objective: values.objective.trim(),
      title_en: values.title_en.trim() || undefined,
      description: values.description.trim() || undefined,
      priority: values.priority,
      visibility_mode: values.visibility_mode,
      sensitivity_level: values.sensitivity_level,
      review_required: values.review_required,
      due_at: toIsoDateTime(values.due_at),
      idempotency_key: idempotencyKey || undefined,
    };
    if (values.owner_mode === "actor" && values.proposed_owner)
      payload.proposed_owner = values.proposed_owner;
    if (values.owner_mode === "unit" && values.target_unit)
      payload.target_unit = values.target_unit;

    try {
      await create.mutateAsync(payload);
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={requestClose}
      title="New case"
      centered
      radius="md"
      size={560}
      closeOnClickOutside={false}
    >
      {/* key remounts a fresh form each time the modal opens */}
      <FormWrapper<CreateCaseFormValues>
        key={opened ? "open" : "closed"}
        initial={INITIAL}
        validation={[schema]}
        finalSubmitFn={submit}
        hasDirtCheck
      >
        <CreateCaseFields
          onCancel={requestClose}
          onDirtyChange={(dirty) => {
            dirtyRef.current = dirty;
          }}
        />
      </FormWrapper>
    </Modal>
  );
}

interface CreateCaseFieldsProps {
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

function CreateCaseFields({ onCancel, onDirtyChange }: CreateCaseFieldsProps) {
  const { form } = useFormInstance<CreateCaseFormValues>();
  const { handleSubmit, isLoading, isDirty } = useFormControls();
  const [advancedOpen, { toggle: toggleAdvanced }] = useDisclosure(false);

  // Surface dirtiness to the parent's close guard.
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const orgId = form.values.organization || null;
  const ownerMode = form.values.owner_mode;

  const orgs = useOrganizationOptions();
  const units = useUnitOptions(orgId);
  const users = useAssignableUserOptions(advancedOpen && ownerMode === "actor");

  // Pre-select when there is exactly one organization (the common single-org
  // deployment) — never override a choice the user already made.
  useEffect(() => {
    if (!form.values.organization && orgs.options.length === 1) {
      form.setFieldValue("organization", orgs.options[0].value);
      // Treat the auto-filled org as the pristine baseline, so a single-org
      // deployment doesn't trip the unsaved-changes guard on an untouched form.
      form.resetDirty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgs.options]);

  // Changing the organization invalidates any unit chosen under the old one.
  function handleOrgChange(value: string | null) {
    form.setFieldValue("organization", value ?? "");
    form.setFieldValue("responsible_unit", "");
    form.setFieldValue("target_unit", null);
  }

  const unitPlaceholder = !orgId
    ? "Select an organization first"
    : units.isLoading
      ? "Loading units…"
      : "Select a unit";

  return (
    <Stack gap="md" p="md">
      <TextInput
        label="Title (Nepali)"
        placeholder="मुद्दाको शीर्षक"
        required
        {...form.getInputProps("title_np")}
      />
      <TextInput
        label="Title (English)"
        placeholder="Case title"
        {...form.getInputProps("title_en")}
      />
      <Textarea
        label="Objective"
        placeholder="What this case is meant to achieve"
        required
        autosize
        minRows={2}
        maxRows={5}
        {...form.getInputProps("objective")}
      />
      <Textarea
        label="Description"
        placeholder="Additional context (optional)"
        autosize
        minRows={2}
        maxRows={6}
        {...form.getInputProps("description")}
      />

      <Select
        label="Organization"
        placeholder={
          orgs.isError
            ? "Couldn't load organizations"
            : orgs.isLoading
              ? "Loading…"
              : "Select an organization"
        }
        required
        searchable
        data={orgs.options}
        disabled={orgs.isError}
        {...form.getInputProps("organization")}
        onChange={handleOrgChange}
      />
      <Select
        label="Responsible unit"
        placeholder={unitPlaceholder}
        required
        searchable
        data={units.options}
        disabled={!orgId || units.isError}
        {...form.getInputProps("responsible_unit")}
      />

      <Group grow align="flex-start" gap="md">
        <Select
          label="Priority"
          data={PRIORITY_OPTIONS}
          allowDeselect={false}
          {...form.getInputProps("priority")}
        />
        <DatePickerInput
          label="Due date"
          placeholder="Pick a date"
          clearable
          {...form.getInputProps("due_at")}
        />
      </Group>

      <Switch
        label="Requires review"
        description="Closure goes through a review round before the case is done"
        {...form.getInputProps("review_required", { type: "checkbox" })}
      />

      <Divider />

      <UnstyledButton
        onClick={toggleAdvanced}
        aria-expanded={advancedOpen}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <Text size="sm" fw={600}>
          Advanced options
        </Text>
        <CaretDownIcon
          size={14}
          aria-label={advancedOpen ? "Collapse" : "Expand"}
          style={{
            transform: advancedOpen ? "rotate(180deg)" : "none",
            transition: "transform 150ms ease",
          }}
        />
      </UnstyledButton>

      <Collapse expanded={advancedOpen}>
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb={4}>
              Initial owner
            </Text>
            <SegmentedControl
              fullWidth
              data={OWNER_MODE_OPTIONS}
              {...form.getInputProps("owner_mode")}
            />
            <Text size="xs" c="dimmed" mt={4}>
              {ownerMode === "self"
                ? "You become the owner and the case is ready to start."
                : "The case waits for the assignee to accept before it starts."}
            </Text>
          </div>

          {ownerMode === "actor" && (
            <Select
              label="Assign to"
              placeholder={
                users.isLoading ? "Loading people…" : "Select a person"
              }
              searchable
              data={users.options}
              {...form.getInputProps("proposed_owner")}
            />
          )}
          {ownerMode === "unit" && (
            <Select
              label="Route to unit"
              placeholder={unitPlaceholder}
              searchable
              data={units.options}
              disabled={!orgId || units.isError}
              {...form.getInputProps("target_unit")}
            />
          )}

          <Group grow align="flex-start" gap="md">
            <Select
              label="Visibility"
              data={VISIBILITY_OPTIONS}
              allowDeselect={false}
              {...form.getInputProps("visibility_mode")}
            />
            <Select
              label="Sensitivity"
              data={SENSITIVITY_OPTIONS}
              allowDeselect={false}
              {...form.getInputProps("sensitivity_level")}
            />
          </Group>
        </Stack>
      </Collapse>

      <Group justify="flex-end" gap="sm" mt="xs">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button loading={isLoading} onClick={handleSubmit}>
          Create case
        </Button>
      </Group>
    </Stack>
  );
}

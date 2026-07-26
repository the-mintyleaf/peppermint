"use client";

import { z } from "zod";
import {
  Button,
  DateInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import type { ModalFormComponentProps } from "@peppermint/admin";
import { FormSection } from "@/components/FormSection";
import type { Checklist } from "../checklists.types";
import { JourneyPickerField } from "./components/JourneyPickerField";
import { TemplatePickerField } from "./components/TemplatePickerField";
import { CHECKLIST_CREATE_INITIAL } from "./ChecklistCreateForm.utils";
import type { ChecklistCreateValues } from "./ChecklistCreateForm.types";

const schema = z
  .object({
    journey: z.string().min(1, "Select a journey"),
    mode: z.enum(["template", "blank"]),
    template: z.string().nullable(),
    title: z.string(),
  })
  .passthrough()
  .superRefine((v, ctx) => {
    if (v.mode === "template" && !v.template) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["template"],
        message: "Choose a template",
      });
    }
    if (v.mode === "blank" && !v.title.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["title"],
        message: "Required for a blank checklist",
      });
    }
  });

/**
 * The manual override (`POST /`) — the normal path is auto-inheritance and
 * calls no endpoint at all (§7). Two mutually exclusive shapes: apply an
 * active template, or build a blank one by hand. Typed against `Checklist` as
 * the record generic (no `initialValues` on create) so it stays interchangeable
 * with the shell's row type, same as `OfferCreateForm`.
 */
export function ChecklistCreateForm({
  onSubmit,
  isLoading,
}: ModalFormComponentProps<Checklist, ChecklistCreateValues>) {
  return (
    <FormWrapper<ChecklistCreateValues>
      initial={CHECKLIST_CREATE_INITIAL}
      validation={[schema]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Text size="xs" c="dimmed">
          There is no button for this on the applicant&apos;s journey by design
          — setting the journey&apos;s destination country creates the checklist
          automatically. Use this only to build a checklist by hand.
        </Text>
        <JourneyPickerField isLoading={isLoading} />
        <ModeFields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function ModeFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<ChecklistCreateValues>();
  const mode = form.values.mode;

  return (
    <FormSection
      title="Checklist source"
      actions={
        <Button
          variant="subtle"
          size="xs"
          disabled={isLoading}
          onClick={() =>
            form.setFieldValue(
              "mode",
              mode === "template" ? "blank" : "template",
            )
          }
        >
          {mode === "template" ? "Start blank" : "Use a template"}
        </Button>
      }
    >
      {mode === "template" ? (
        <TemplatePickerField isLoading={isLoading} />
      ) : (
        <BlankChecklistFields isLoading={isLoading} />
      )}
    </FormSection>
  );
}

function BlankChecklistFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<ChecklistCreateValues>();
  return (
    <Stack gap="md">
      <TextInput
        label="Title"
        placeholder="e.g. Canada — Scholarship track"
        required
        disabled={isLoading}
        {...form.getInputProps("title")}
      />
      <Textarea
        label="Description"
        placeholder="What this checklist is for"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("description")}
      />
      <TextInput
        label="Assigned to (user ID, optional)"
        description="No user picker is available yet — paste the user's id"
        disabled={isLoading}
        {...form.getInputProps("assigned_to")}
      />
      <DateInput
        label="Due date"
        valueFormat="YYYY-MM-DD"
        clearable
        disabled={isLoading}
        {...form.getInputProps("due_at")}
      />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("notes")}
      />
    </Stack>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Create checklist
    </Button>
  );
}

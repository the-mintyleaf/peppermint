"use client";

import { useEffect, useRef, useState } from "react";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import type { ModalFormComponentProps } from "@peppermint/admin";
import { Button, Loader, Select, Stack, TextInput } from "@peppermint/ui";
import type { ComboboxItem } from "@peppermint/ui";
import { useCreateLeadSource, useLeadSources } from "../leadManagement.hooks";
import { useLeadAccess } from "../leadAccess.hooks";
import type {
  LeadBoardRow,
  LeadCreatePayload,
  LeadSource,
} from "../leadManagement.types";
import { referenceEntryLabel, toReferenceCode } from "../referenceEntry.utils";
import { AcademicBackgroundSection } from "./AcademicBackgroundSection";
import { ContactNumbersField } from "./ContactNumbersField";
import { LanguageSection } from "./LanguageSection";
import { useLeadFormSubmitError } from "./LeadForm.context";
import { buildLeadSchema } from "./LeadForm.schema";
import type { LeadFormValues } from "./LeadForm.types";
import {
  applyLeadServerErrors,
  toLeadFormValues,
  toLeadPayload,
} from "./LeadForm.utils";
import { StudyInterestSection } from "./StudyInterestSection";

const CREATE_SOURCE_VALUE = "__create_new_source__";

/**
 * Shared create+edit form (`POST`/`PATCH /api/v1/leads/`,
 * `docs/backend/lead-management/INTEGRATION.md` §7). No `stage` field —
 * never writable here; stage moves only through the dedicated lifecycle
 * actions. Same field set both times, so one component serves both
 * `createFormComponent` and `editFormComponent`.
 *
 * Sections, in the order a call goes: who they are (identity, source,
 * contact) → what they want to study → what they have already studied →
 * English tests. Everything after contact is optional preliminary detail.
 */
export function LeadForm({
  onSubmit,
  isLoading,
  initialValues,
}: ModalFormComponentProps<LeadBoardRow, LeadCreatePayload>) {
  const { data: sources = [], isLoading: sourcesLoading } = useLeadSources();
  const initial = toLeadFormValues(initialValues);
  const schema = buildLeadSchema(sources);
  const hadExistingStudyInterest = Boolean(initialValues?.study_interest);
  const isEdit = Boolean(initialValues);

  return (
    <FormWrapper<LeadFormValues>
      initial={initial}
      validation={[schema]}
      finalSubmitFn={async (values) => {
        // `FormWrapper` freezes its `validation` schemas at mount, so if
        // `sources` was still loading then, the zod-level requires_detail
        // check above can be stale — this re-checks against the *live*
        // `sources` closure (finalSubmitFn itself isn't frozen) as the
        // authoritative gate.
        const selectedSource = sources.find((s) => s.id === values.source);
        if (selectedSource?.requires_detail && !values.source_detail.trim()) {
          return {
            ok: false,
            message: "This lead source requires a short description.",
          };
        }
        onSubmit(toLeadPayload(values, { hadExistingStudyInterest, isEdit }));
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <ServerErrorsBridge />
        <Fields
          sources={sources}
          sourcesLoading={sourcesLoading}
          isLoading={isLoading}
        />
        <SubmitButton isLoading={isLoading} isEdit={isEdit} />
      </Stack>
    </FormWrapper>
  );
}

/**
 * Applies a failed save's field details (from the board's
 * `LeadFormSubmitErrorContext`) to this form. Only errors raised after the
 * form mounted, and each once — so reopening the modal never resurrects a
 * previous attempt's errors, and editing a field never re-applies them.
 */
function ServerErrorsBridge() {
  const { form } = useFormInstance<LeadFormValues>();
  const submitError = useLeadFormSubmitError();
  const appliedSeq = useRef(submitError?.seq ?? 0);

  useEffect(() => {
    if (!submitError || submitError.seq <= appliedSeq.current) return;
    appliedSeq.current = submitError.seq;
    applyLeadServerErrors(form, submitError.error);
  }, [form, submitError]);

  return null;
}

function Fields({
  sources,
  sourcesLoading,
  isLoading,
}: {
  sources: LeadSource[];
  sourcesLoading: boolean;
  isLoading: boolean;
}) {
  const { form } = useFormInstance<LeadFormValues>();
  // The exact `admin` tier, not `useCurrentUser().isAdmin` (which also
  // covers `superadmin`, refused with `LEADS_ACTOR_FORBIDDEN` too).
  const { isLeadAdmin: isAdmin } = useLeadAccess();
  const selectedSource = sources.find((s) => s.id === form.values.source);
  const [sourceSearch, setSourceSearch] = useState("");
  const createSourceMutation = useCreateLeadSource();

  // `fetchLeadSources()` never sends `include_inactive=true` (retired
  // sources must stay hidden from every picker except the reference-data
  // admin screen), so `sources` never contains a retired entry to resolve a
  // label from. Editing a lead whose source has since been retired shows
  // this field blank — a known, accepted limitation shared with every other
  // reference-data picker in this app, not something to work around here.
  // `toUpdatePayload` (LeadManagementBoard.tsx) still omits `source` from
  // the PATCH when it's untouched, so leaving the field alone doesn't block
  // saving the rest of the edit.
  const sourceOptions = sources.map((s) => ({
    value: s.id,
    label: referenceEntryLabel(s),
  }));

  const trimmedSearch = sourceSearch.trim();
  // Only Admins may create a source (`LEADS_ACTOR_FORBIDDEN` for anyone else
  // — `docs/backend/lead-management/INTEGRATION.md` §6), so this option only
  // ever appears for `authorityType === "admin"`. It is offered only once
  // there is text to name the source with, that text isn't already a source,
  // and it can produce a valid `code`.
  const canCreateTypedSource =
    isAdmin &&
    trimmedSearch !== "" &&
    toReferenceCode(trimmedSearch) !== "" &&
    !sources.some(
      (s) =>
        referenceEntryLabel(s).toLowerCase() === trimmedSearch.toLowerCase(),
    );

  const selectData = canCreateTypedSource
    ? [
        ...sourceOptions,
        {
          value: CREATE_SOURCE_VALUE,
          label: `+ Add "${trimmedSearch}" as a new lead source`,
        },
      ]
    : sourceOptions;

  const handleCreateTypedSource = async () => {
    try {
      const created = await createSourceMutation.mutateAsync({
        code: toReferenceCode(trimmedSearch),
        name: trimmedSearch,
      });
      form.setFieldValue("source", created.id);
      form.setFieldValue("source_detail", "");
      setSourceSearch(referenceEntryLabel(created));
    } catch {
      // `useCreateLeadSource` already raised the notification; the picker
      // keeps the typed text so the admin can retry or pick something else.
    }
  };

  return (
    <>
      <TextInput
        label="Full name"
        placeholder="Ram Bahadur Shrestha"
        required
        disabled={isLoading}
        {...form.getInputProps("full_name")}
      />

      <TextInput
        label="Email"
        type="email"
        placeholder="ram@example.com"
        autoComplete="email"
        disabled={isLoading}
        {...form.getInputProps("email")}
      />

      <Select
        label="Lead source"
        placeholder={
          sourcesLoading ? "Loading sources…" : "How did they hear about us?"
        }
        description={
          isAdmin ? "Type a new name to add a source you don't see." : undefined
        }
        data={selectData}
        // Mantine's own filter, deliberately: it is skipped while the search
        // text still equals the selected option's label, so reopening the
        // dropdown after a pick shows every source rather than only the one
        // already chosen. Filtering by hand outside the component (as this
        // did) loses that and strands the user on a one-item list. The
        // create row is exempt — it is an action, not a match.
        filter={({ options, search }) => {
          const query = search.trim().toLowerCase();
          return (options as ComboboxItem[]).filter(
            (option) =>
              option.value === CREATE_SOURCE_VALUE ||
              option.label.toLowerCase().includes(query),
          );
        }}
        searchable
        searchValue={sourceSearch}
        onSearchChange={setSourceSearch}
        nothingFoundMessage={sourcesLoading ? "Loading…" : "No matching source"}
        rightSection={
          sourcesLoading || createSourceMutation.isPending ? (
            <Loader size="xs" />
          ) : undefined
        }
        required
        disabled={isLoading || createSourceMutation.isPending}
        {...form.getInputProps("source")}
        onChange={(value) => {
          if (value === CREATE_SOURCE_VALUE) {
            void handleCreateTypedSource();
            return;
          }
          form.setFieldValue("source", value ?? "");
          // Always clear on any source change, not just when the new
          // source doesn't require one — an explanation written for the
          // old source is never valid for a different one, even when
          // both happen to require detail.
          form.setFieldValue("source_detail", "");
        }}
      />

      {selectedSource?.requires_detail ? (
        <TextInput
          label="Please specify"
          placeholder="e.g. friend's name, event name"
          required
          disabled={isLoading}
          {...form.getInputProps("source_detail")}
        />
      ) : null}

      <TextInput
        label="Address"
        placeholder="Ward, tole, city"
        disabled={isLoading}
        {...form.getInputProps("address")}
      />

      <ContactNumbersField />

      <StudyInterestSection />

      <AcademicBackgroundSection />

      <LanguageSection />
    </>
  );
}

function SubmitButton({
  isLoading,
  isEdit,
}: {
  isLoading: boolean;
  isEdit: boolean;
}) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      {isEdit ? "Save changes" : "Add lead"}
    </Button>
  );
}

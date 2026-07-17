"use client";

import { useMemo } from "react";
import { Anchor, Group, Stack, Text, notifications } from "@peppermint/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";

import {
  applicantKeys,
  createApplicant,
  useApplicantMutation,
} from "@/modules/admin/applicant/_shared";
import type {
  Applicant,
  DuplicateMeta,
} from "@/modules/admin/applicant/_shared";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import {
  ApplicantForm,
  toCreatePayload,
} from "@/modules/admin/applicant/applicants/form";
import type { ApplicantFormValues } from "@/modules/admin/applicant/applicants/form";

import type { CreateStudentViewProps } from "../../NewDocumentModal.types";

/**
 * Inline "create a student" screen reached from the search view's empty-result CTA.
 * Reuses the canonical `ApplicantForm` (seeded with the searched name) so validation
 * and the role-scoped payload stay identical to the Applicants module; on success it
 * hands the new id back so the modal can open that student's document workspace.
 */
export function CreateStudentView({
  initialName,
  onBack,
  onCreated,
}: CreateStudentViewProps) {
  const { isAdmin } = useCurrentUser();

  const initial = useMemo(
    () => ({ first_name: initialName.trim() }),
    [initialName],
  );

  const mutation = useApplicantMutation<
    { data: Applicant; meta: DuplicateMeta },
    ApplicantFormValues
  >({
    mutationFn: (values) => createApplicant(toCreatePayload(values, isAdmin)),
    successMessage: "Student created.",
    invalidateKeys: [applicantKeys.lists()],
    onSuccess: ({ data, meta }) => {
      // Non-blocking heads-up, same as the Applicants create flow: the student was
      // created, but the backend spotted a similar record worth reviewing/merging.
      if (meta.possible_duplicate && meta.matches?.length) {
        notifications.show({
          color: "orange",
          title: "Possible duplicate",
          message:
            "This student was created, but a similar record already exists — review and merge from Applicants if needed.",
        });
      }
      onCreated(data.id);
    },
  });

  return (
    <Stack gap="sm">
      <Anchor component="button" type="button" size="sm" onClick={onBack}>
        <Group gap={4} align="center" wrap="nowrap">
          <ArrowLeftIcon size={14} />
          <Text size="sm">Back to search</Text>
        </Group>
      </Anchor>

      <ApplicantForm
        initial={initial}
        onSubmit={(values) => mutation.mutate(values)}
        isLoading={mutation.isPending}
      />
    </Stack>
  );
}

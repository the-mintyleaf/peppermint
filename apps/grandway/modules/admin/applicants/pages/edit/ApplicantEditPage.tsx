"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Center,
  Loader,
  ModalPaper,
  Stack,
  Text,
} from "@peppermint/ui";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import { useApplicantDetail, useUpdateApplicant } from "../../applicants.hooks";
import { ApplicantForm } from "../../form/ApplicantForm";

/**
 * Open to both Admin and Lead Manager (`docs/backend/applicants/CONCEPT.md`
 * — either "may... view/edit any applicant"). Always the real detail fetch,
 * never a trimmed list row — same rationale as `LeadDetailDrawer`. A 404 is
 * always genuine here (unlike leads, there's no ownership to hide,
 * `INTEGRATION.md` §3), so it renders as a plain not-found, never
 * "access denied".
 */
function ApplicantEditPageContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    data: applicant,
    isLoading,
    isError,
    error,
    refetch,
  } = useApplicantDetail(id);
  const mutation = useUpdateApplicant(id);

  const notFound =
    isError && getApiError(error).code === "APPLICANTS_APPLICANT_NOT_FOUND";

  if (isLoading) {
    return (
      <ModalPaper withBorder>
        <Center h={300}>
          <Loader size="sm" />
        </Center>
      </ModalPaper>
    );
  }

  if (notFound) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Applicant not found.
          </Text>
          <Button
            size="xs"
            variant="default"
            onClick={() => router.push("/admin/applicants")}
          >
            Back to applicants
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  if (isError || !applicant) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Couldn&apos;t load this applicant.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  return (
    <ModalPaper withBorder>
      <ApplicantForm
        mode="edit"
        initialValues={applicant}
        onBack={() => history.back()}
        onSubmit={async (payload) => {
          try {
            await mutation.mutateAsync(payload);
            router.push(`/admin/applicants/${id}`);
          } catch {
            // `useUpdateApplicant` (useAppMutation) already showed the
            // failure notification — nothing further to do here.
          }
        }}
      />
    </ModalPaper>
  );
}

export function ModuleApplicantEdit() {
  return (
    <RequireLeadAccess>
      <ApplicantEditPageContent />
    </RequireLeadAccess>
  );
}

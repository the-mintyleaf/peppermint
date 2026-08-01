"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Center,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
} from "@peppermint/ui";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import { useApplicantDetail, useUpdateApplicant } from "../../applicants.hooks";
import { applicantDisplayName } from "../../applicants.labels";
import { ApplicantForm } from "../../form/ApplicantForm";
import {
  useApplicantPhotograph,
  useSaveApplicantPhotograph,
} from "../../photograph";

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
  // Shares `ApplicantPhotoField`'s query key, so this resolves the id of the
  // photo being replaced without a second request. Declared here, above the
  // loading/error returns, because hooks can't sit below a conditional.
  const currentPhotograph = useApplicantPhotograph(id);
  const savePhotograph = useSaveApplicantPhotograph(
    id,
    currentPhotograph.file?.id ?? null,
  );

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

  const displayName = applicantDisplayName(applicant);

  return (
    <>
      {/* Same convention as `ApplicantDetail.tsx` / `ApplicantsList.tsx` —
       * `ModuleHeader` sits outside `ModalPaper`, not inside it.
       * `FormShell` (rendered inside `ApplicantForm`) also renders its own
       * internal `ModuleHeader` with no breadcrumbs — that's a known,
       * accepted blank strip inside the card until `FormShell` grows an
       * opt-out for it. */}
      <ModuleHeader
        breadcrumbItems={[
          { label: "Applicants", href: "/admin/applicants" },
          { label: displayName, href: `/admin/applicants/${id}` },
          { label: "Edit", href: `/admin/applicants/${id}/edit` },
        ]}
      />
      {/* `ModalPaper` uses its default height here (`calc(100% - header)`)
       * since `ModuleHeader` is now a real sibling above it — the flex
       * column style still lets `FormShell`'s `flex: 1` scroll region get a
       * bounded height to scroll within instead of clipping. */}
      <ModalPaper
        withBorder
        style={{ display: "flex", flexDirection: "column" }}
      >
        <ApplicantForm
          mode="edit"
          initialValues={applicant}
          onBack={() => history.back()}
          onSubmit={async (payload, photograph) => {
            try {
              await mutation.mutateAsync(payload);
            } catch {
              // `useUpdateApplicant` (useAppMutation) already showed the
              // failure notification. Stay on the form and skip the photo:
              // uploading a picture for a record whose own edits just failed
              // would split the save in half.
              return;
            }
            if (photograph) {
              try {
                await savePhotograph.mutateAsync(photograph);
              } catch {
                // The record itself saved; only the photo didn't. Both
                // notifications have already fired, and staying on the form
                // keeps the picked file in place so Save retries just the
                // photo (the PATCH re-sends unchanged values harmlessly).
                return;
              }
            }
            router.push(`/admin/applicants/${id}`);
          }}
        />
      </ModalPaper>
    </>
  );
}

export function ModuleApplicantEdit() {
  return (
    <RequireLeadAccess>
      <ApplicantEditPageContent />
    </RequireLeadAccess>
  );
}

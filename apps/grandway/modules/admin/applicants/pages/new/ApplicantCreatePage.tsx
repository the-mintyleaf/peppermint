"use client";

import { useRouter } from "next/navigation";
import { ModalPaper } from "@peppermint/ui";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { useCreateApplicant } from "../../applicants.hooks";
import { ApplicantForm } from "../../form/ApplicantForm";

/** Admin only (`docs/backend/applicants/FLOWS.md` "Create an applicant
 * directly") — the list page already hides the "New applicant" button for a
 * Lead Manager; a direct navigation here still 403s server-side
 * (`APPLICANTS_ACTOR_FORBIDDEN`), surfaced via the mutation's own error
 * notification. */
function ApplicantCreatePageContent() {
  const router = useRouter();
  const mutation = useCreateApplicant();

  return (
    <ModalPaper withBorder>
      <ApplicantForm
        mode="create"
        onBack={() => history.back()}
        onSubmit={async (payload) => {
          try {
            const created = await mutation.mutateAsync(payload);
            router.push(`/admin/applicants/${created.id}`);
          } catch {
            // `useCreateApplicant` (useAppMutation) already showed the
            // failure notification — nothing further to do here.
          }
        }}
      />
    </ModalPaper>
  );
}

export function ModuleApplicantCreate() {
  return (
    <RequireLeadAccess>
      <ApplicantCreatePageContent />
    </RequireLeadAccess>
  );
}

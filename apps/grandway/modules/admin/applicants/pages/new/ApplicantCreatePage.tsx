"use client";

import { useRouter } from "next/navigation";
import { ModalPaper, ModuleHeader } from "@peppermint/ui";
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
          { label: "New applicant", href: "/admin/applicants/new" },
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
          mode="create"
          onBack={() => history.back()}
          // The second `onSubmit` argument (a staged photograph) is always
          // `null` here — the photo control is hidden on create, since a file
          // needs an existing owner. It is added from the edit form, which is
          // where this push lands the user anyway.
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
    </>
  );
}

export function ModuleApplicantCreate() {
  return (
    <RequireLeadAccess>
      <ApplicantCreatePageContent />
    </RequireLeadAccess>
  );
}

"use client";

import { useParams } from "next/navigation";

import { RequireStaff } from "@/components/RequireStaff";
import { ApplicantDetailShell } from "../_shared";
import { AssignmentsSection } from "./AssignmentsSection";

function AssignmentsPageContent() {
  const { applicantId } = useParams<{ applicantId: string }>();
  return (
    <ApplicantDetailShell applicantId={applicantId} activeSection="assignments">
      <AssignmentsSection applicantId={applicantId} />
    </ApplicantDetailShell>
  );
}

/** Assignment history — assign / end (§11). Admin/superadmin only. */
export function AssignmentsPage() {
  return (
    <RequireStaff>
      <AssignmentsPageContent />
    </RequireStaff>
  );
}

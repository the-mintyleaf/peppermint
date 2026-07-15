"use client";

import { useParams } from "next/navigation";

import { RequireStaff } from "@/components/RequireStaff";
import { ApplicantDetailShell } from "../_shared";
import { CasesSection } from "./CasesSection";

function CasesPageContent() {
  const { applicantId } = useParams<{ applicantId: string }>();
  return (
    <ApplicantDetailShell applicantId={applicantId} activeSection="cases">
      <CasesSection applicantId={applicantId} />
    </ApplicantDetailShell>
  );
}

/** Application cases list + open (§10). Admin/superadmin only. */
export function CasesPage() {
  return (
    <RequireStaff>
      <CasesPageContent />
    </RequireStaff>
  );
}

"use client";

import { useParams } from "next/navigation";
import { Tabs } from "@peppermint/ui";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/csr/ClipboardText";

import { RequireStaff } from "@/components/RequireStaff";
import { ApplicantDetailShell } from "../_shared";
import { InterestProfilePanel } from "./interest-profile/InterestProfilePanel";
import { AssessmentsSection } from "./qualification-assessments/AssessmentsSection";

function InterestsPageContent() {
  const { applicantId } = useParams<{ applicantId: string }>();

  return (
    <ApplicantDetailShell applicantId={applicantId} activeSection="interests">
      <Tabs defaultValue="profile">
        <Tabs.List mb="md">
          <Tabs.Tab
            value="profile"
            leftSection={<CompassIcon size={15} aria-hidden />}
          >
            Interest profile
          </Tabs.Tab>
          <Tabs.Tab
            value="assessments"
            leftSection={<ClipboardTextIcon size={15} aria-hidden />}
          >
            Assessments
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="profile">
          <InterestProfilePanel applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="assessments">
          <AssessmentsSection applicantId={applicantId} />
        </Tabs.Panel>
      </Tabs>
    </ApplicantDetailShell>
  );
}

/** Interest profile + qualification assessments (§6, §9). Admin/superadmin only. */
export function InterestsPage() {
  return (
    <RequireStaff>
      <InterestsPageContent />
    </RequireStaff>
  );
}

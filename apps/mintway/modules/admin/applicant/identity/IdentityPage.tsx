"use client";

import { useParams } from "next/navigation";
import { Tabs } from "@peppermint/ui";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { FilesIcon } from "@phosphor-icons/react/dist/csr/Files";

import { RequireStaff } from "@/components/RequireStaff";
import { ApplicantDetailShell } from "../_shared";
import { EvidenceMediaSection } from "./media/EvidenceMediaSection";
import { IdentityDocumentsSection } from "./identity-documents/IdentityDocumentsSection";

function IdentityPageContent() {
  const { applicantId } = useParams<{ applicantId: string }>();

  return (
    <ApplicantDetailShell applicantId={applicantId} activeSection="identity">
      <Tabs defaultValue="documents">
        <Tabs.List mb="md">
          <Tabs.Tab
            value="documents"
            leftSection={<IdentificationCardIcon size={15} aria-hidden />}
          >
            Identity documents
          </Tabs.Tab>
          <Tabs.Tab
            value="media"
            leftSection={<FilesIcon size={15} aria-hidden />}
          >
            Evidence media
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="documents">
          <IdentityDocumentsSection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="media">
          <EvidenceMediaSection applicantId={applicantId} />
        </Tabs.Panel>
      </Tabs>
    </ApplicantDetailShell>
  );
}

/** Identity documents + evidence media (§5.2, §7). Admin/superadmin only. */
export function IdentityPage() {
  return (
    <RequireStaff>
      <IdentityPageContent />
    </RequireStaff>
  );
}

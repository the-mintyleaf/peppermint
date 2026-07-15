"use client";

import { useParams } from "next/navigation";
import { Tabs } from "@peppermint/ui";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { LifebuoyIcon } from "@phosphor-icons/react/dist/csr/Lifebuoy";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";

import { RequireStaff } from "@/components/RequireStaff";
import { ApplicantDetailShell } from "../_shared";
import { FamilyMembersSection } from "./family-members";
import { EmergencyContactsSection } from "./emergency-contacts";
import { ReferencesSection } from "./references";

function FamilyPageContent() {
  const { applicantId } = useParams<{ applicantId: string }>();

  return (
    <ApplicantDetailShell applicantId={applicantId} activeSection="family">
      <Tabs defaultValue="family-members" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab
            value="family-members"
            leftSection={<UsersThreeIcon size={16} aria-hidden />}
          >
            Family members
          </Tabs.Tab>
          <Tabs.Tab
            value="emergency-contacts"
            leftSection={<LifebuoyIcon size={16} aria-hidden />}
          >
            Emergency contacts
          </Tabs.Tab>
          <Tabs.Tab
            value="references"
            leftSection={<AddressBookIcon size={16} aria-hidden />}
          >
            References
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="family-members">
          <FamilyMembersSection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="emergency-contacts">
          <EmergencyContactsSection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="references">
          <ReferencesSection applicantId={applicantId} />
        </Tabs.Panel>
      </Tabs>
    </ApplicantDetailShell>
  );
}

/** Family, emergency contacts, and references — the admin-only relations surface (§9). */
export function FamilyPage() {
  return (
    <RequireStaff>
      <FamilyPageContent />
    </RequireStaff>
  );
}

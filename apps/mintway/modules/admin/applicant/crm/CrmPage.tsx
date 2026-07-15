"use client";

import { useParams } from "next/navigation";
import { Tabs } from "@peppermint/ui";
import { ChatCircleTextIcon } from "@phosphor-icons/react/dist/csr/ChatCircleText";
import { HandCoinsIcon } from "@phosphor-icons/react/dist/csr/HandCoins";
import { AirplaneIcon } from "@phosphor-icons/react/dist/csr/Airplane";
import { StampIcon } from "@phosphor-icons/react/dist/csr/Stamp";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";

import { RequireStaff } from "@/components/RequireStaff";
import { ApplicantDetailShell } from "../_shared";
import { InteractionsSection } from "./interactions";
import { SponsorsSection } from "./sponsors";
import { TravelHistorySection } from "./travel-history";
import { VisaHistorySection } from "./visa-history";
import { ConsentsSection } from "./consents";

function CrmPageContent() {
  const { applicantId } = useParams<{ applicantId: string }>();

  return (
    <ApplicantDetailShell applicantId={applicantId} activeSection="crm">
      <Tabs defaultValue="interactions" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab
            value="interactions"
            leftSection={<ChatCircleTextIcon size={16} aria-hidden />}
          >
            Interactions
          </Tabs.Tab>
          <Tabs.Tab
            value="sponsors"
            leftSection={<HandCoinsIcon size={16} aria-hidden />}
          >
            Sponsors
          </Tabs.Tab>
          <Tabs.Tab
            value="travel-history"
            leftSection={<AirplaneIcon size={16} aria-hidden />}
          >
            Travel history
          </Tabs.Tab>
          <Tabs.Tab
            value="visa-history"
            leftSection={<StampIcon size={16} aria-hidden />}
          >
            Visa history
          </Tabs.Tab>
          <Tabs.Tab
            value="consents"
            leftSection={<ShieldCheckIcon size={16} aria-hidden />}
          >
            Consents
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="interactions">
          <InteractionsSection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="sponsors">
          <SponsorsSection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="travel-history">
          <TravelHistorySection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="visa-history">
          <VisaHistorySection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="consents">
          <ConsentsSection applicantId={applicantId} />
        </Tabs.Panel>
      </Tabs>
    </ApplicantDetailShell>
  );
}

/** Interactions, sponsors, travel/visa history, and consents — the admin-only CRM &
 * compliance surface (§8). */
export function CrmPage() {
  return (
    <RequireStaff>
      <CrmPageContent />
    </RequireStaff>
  );
}

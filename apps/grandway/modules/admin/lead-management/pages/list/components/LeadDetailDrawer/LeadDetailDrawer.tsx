"use client";

import {
  Button,
  Center,
  Drawer,
  Loader,
  Stack,
  Tabs,
  Text,
} from "@peppermint/ui";
import { getApiError } from "@/lib/authErrorMessages";
import { useLeadDetail } from "../../../../leadManagement.hooks";
import { LeadHistoryPanel } from "./LeadHistoryPanel";
import { LeadNotesPanel } from "./LeadNotesPanel";
import { LeadOverviewPanel } from "./LeadOverviewPanel";
import type { LeadDetailDrawerProps } from "./LeadDetailDrawer.types";

/**
 * Full detail, always the real fetch — never trusts the board's trimmed row.
 * A 404 (out-of-scope lead) renders as generic not-found, never "access
 * denied" — the backend deliberately can't tell the two apart
 * (`docs/backend/lead-management/INTEGRATION.md` §8). A *different* failure
 * (network blip, 500) is NOT presented as "not found" — that would assert a
 * fact the app doesn't actually know; it gets a distinct message and a retry.
 */
export function LeadDetailDrawer({
  leadId,
  opened,
  onClose,
}: LeadDetailDrawerProps) {
  const {
    data: lead,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeadDetail(leadId);
  const notFound =
    isError && getApiError(error).code === "LEADS_LEAD_NOT_FOUND";

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={lead ? lead.full_name_en || lead.full_name_np : "Lead"}
    >
      {isLoading ? (
        <Center h={200}>
          <Loader size="sm" />
        </Center>
      ) : notFound ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Lead not found.
        </Text>
      ) : isError || !lead ? (
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed" ta="center">
            Couldn&apos;t load this lead.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      ) : (
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="notes">Notes</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <LeadOverviewPanel lead={lead} />
          </Tabs.Panel>

          <Tabs.Panel value="notes" pt="md">
            <LeadNotesPanel leadId={lead.id} />
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="md">
            <LeadHistoryPanel leadId={lead.id} />
          </Tabs.Panel>
        </Tabs>
      )}
    </Drawer>
  );
}

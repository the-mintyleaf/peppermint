"use client";

import {
  Button,
  Center,
  Divider,
  Drawer,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
  dayjs,
} from "@peppermint/ui";
import { getApiError } from "@/lib/authErrorMessages";
import { useLeadDetail } from "../../../../leadManagement.hooks";
import type { LeadDetail } from "../../../../leadManagement.types";
import { LeadHistoryPanel } from "./LeadHistoryPanel";
import { LeadNotesPanel } from "./LeadNotesPanel";
import { LeadOverviewPanel } from "./LeadOverviewPanel";
import type { LeadDetailDrawerProps } from "./LeadDetailDrawer.types";

/**
 * The profile's anchor: who this is, and where the record came from. The name
 * sits at `h3`, sized for the drawer's narrow column rather than a page. Its
 * provenance line carries the only two facts the property list below doesn't
 * repeat — when the lead was added and by whom. Stage is a lever, not a fact,
 * so it leads the overview below instead of crowding the heading.
 */
function LeadProfileHeader({ lead }: { lead: LeadDetail }) {
  const addedBy = lead.created_by.display_name || lead.created_by.username;

  return (
    <Stack gap={2}>
      <Title order={3}>{lead.full_name}</Title>
      <Text size="xs" c="dimmed">
        Added {dayjs(lead.created_at).format("MMM D, YYYY")}
        {addedBy ? ` by ${addedBy}` : ""}
      </Text>
    </Stack>
  );
}

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

  // `md` (~440px) — a reading column, half the width this drawer used to take.
  // The profile is a property list plus two tabs, none of which needs a second
  // column, and the narrower panel leaves the board it opened from in view.
  //
  // The header names the surface ("Lead Profile"), not the record — the lead's
  // own name is the in-body heading below, so the drawer identifies who it's
  // about without duplicating the name in the chrome.
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={<Title order={4}>Lead Profile</Title>}
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
        <Stack gap="md">
          <LeadProfileHeader lead={lead} />

          <LeadOverviewPanel lead={lead} />

          <Divider />

          <Tabs defaultValue="notes">
            <Tabs.List>
              <Tabs.Tab value="notes">
                <Text size="xs" fw={600}>
                  Notes
                </Text>
              </Tabs.Tab>
              <Tabs.Tab value="history">
                <Text size="xs" fw={600}>
                  History
                </Text>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="notes" pt="md">
              <LeadNotesPanel leadId={lead.id} />
            </Tabs.Panel>

            <Tabs.Panel value="history" pt="md">
              <LeadHistoryPanel leadId={lead.id} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      )}
    </Drawer>
  );
}

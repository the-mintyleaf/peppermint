"use client";

import {
  Box,
  Button,
  Center,
  Drawer,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
} from "@peppermint/ui";
import { getApiError } from "@/lib/authErrorMessages";
import { categorizeLead } from "../../../../leadCategory.utils";
import { useLeadDetail } from "../../../../leadManagement.hooks";
import type { LeadDetail } from "../../../../leadManagement.types";
import { LeadStageSwitch } from "../LeadStageSwitch";
import { LeadHistoryPanel } from "./LeadHistoryPanel";
import { LeadNotesPanel } from "./LeadNotesPanel";
import { LeadOverviewPanel } from "./LeadOverviewPanel";
import type { LeadDetailDrawerProps } from "./LeadDetailDrawer.types";

function leadDisplayName(lead: LeadDetail): string {
  return lead.full_name || lead.full_name_en || lead.full_name_np;
}

/** Big heading + the interactive stage switch — the profile's anchor and its one primary lever. */
function LeadProfileHeader({ lead }: { lead: LeadDetail }) {
  const displayName = leadDisplayName(lead);
  const romanized = lead.full_name_romanized;
  const showRomanized = romanized && romanized !== displayName;

  return (
    <Stack gap="sm">
      <Stack gap={2}>
        <Title order={2}>{displayName}</Title>
        {showRomanized ? (
          <Text size="sm" c="dimmed">
            {romanized}
          </Text>
        ) : null}
      </Stack>
      <Box w={{ base: "100%", xs: 260 }}>
        {/* The switch and its modals type `lead` as the board row; the drawer
            has the full detail, so we attach the same client-computed category
            the board derives rather than widen four shared contracts. */}
        <LeadStageSwitch lead={{ ...lead, category: categorizeLead(lead) }} />
      </Box>
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

  // The Drawer's `title` is the dialog's accessible name — it must identify the
  // record, not read "Lead profile" for every lead (a screen reader would
  // otherwise announce every drawer identically). The big in-body heading is
  // the visual anchor; this keeps the two in sync per record.
  const accessibleName = lead ? leadDisplayName(lead) : "Lead";

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="xl"
      title={accessibleName}
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
        <Stack gap="lg">
          <LeadProfileHeader lead={lead} />

          <LeadOverviewPanel lead={lead} />

          <Tabs defaultValue="notes">
            <Tabs.List>
              <Tabs.Tab value="notes">Notes</Tabs.Tab>
              <Tabs.Tab value="history">History</Tabs.Tab>
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

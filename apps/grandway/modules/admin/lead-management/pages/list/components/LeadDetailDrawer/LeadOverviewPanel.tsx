"use client";

import Link from "next/link";
import {
  Anchor,
  Badge,
  Box,
  Group,
  SimpleGrid,
  Stack,
  Text,
  dayjs,
} from "@peppermint/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { categorizeLead } from "../../../../leadCategory.utils";
import type { LeadDetail } from "../../../../leadManagement.types";
import { referenceEntryLabel } from "../../../../referenceEntry.utils";
import { LeadStageSwitch } from "../LeadStageSwitch";
import { DetailField } from "./components";

function formatDateTime(value: string | null): string | null {
  return value ? dayjs(value).format("MMM D, YYYY h:mm A") : null;
}

/**
 * The always-on body of the lead profile. Stage leads on its own full-width row
 * as an interactive control (the switch is its value) and keeps a larger `sm`
 * font — it's the one lever here, not a fact. Everything below it is read-only
 * fact, rendered at `xs` in a simple two-column grid of label→value pairs.
 * Study-interest and lifecycle pairs only appear when that data exists.
 */
export function LeadOverviewPanel({ lead }: { lead: LeadDetail }) {
  const studyInterest = lead.study_interest;

  return (
    <Stack gap="md">
      <DetailField
        label="Stage"
        size="sm"
        value={
          <Box w={{ base: "100%", xs: 240 }}>
            <LeadStageSwitch
              lead={{ ...lead, category: categorizeLead(lead) }}
            />
          </Box>
        }
      />

      <SimpleGrid cols={2} spacing="md" verticalSpacing="sm">
        <DetailField label="Email" value={lead.email} />
        <DetailField label="Address" value={lead.address} />
        <DetailField
          label="Phone"
          value={
            lead.contact_numbers.length === 0 ? null : (
              <Stack gap={4}>
                {lead.contact_numbers.map((c) => (
                  <Group key={c.id ?? c.number} gap={6} wrap="nowrap">
                    <Text size="xs" fw={500}>
                      {c.number}
                    </Text>
                    <Text size="xs" c="dimmed" tt="capitalize">
                      {c.label}
                    </Text>
                    {c.is_primary ? (
                      <Badge size="xs" variant="light" color="blue">
                        Primary
                      </Badge>
                    ) : null}
                  </Group>
                ))}
              </Stack>
            )
          }
        />

        <DetailField label="Source" value={referenceEntryLabel(lead.source)} />
        {lead.source_detail ? (
          <DetailField label="Source detail" value={lead.source_detail} />
        ) : null}

        <DetailField
          label="Last follow-up"
          value={formatDateTime(lead.last_followed_up_at)}
        />
        <DetailField
          label="Followed up by"
          value={
            lead.last_followed_up_by?.display_name ||
            lead.last_followed_up_by?.username ||
            null
          }
        />

        {studyInterest ? (
          <>
            <DetailField
              label="Countries"
              value={studyInterest.interested_countries.join(", ") || null}
            />
            <DetailField
              label="Study level"
              value={studyInterest.study_level || null}
            />
            <DetailField
              label="Field of study"
              value={studyInterest.field_of_study || null}
            />
            <DetailField
              label="Preferred intake"
              value={studyInterest.preferred_intake || null}
            />
            <DetailField
              label="Budget"
              value={
                studyInterest.budget_amount
                  ? `${studyInterest.budget_amount} ${studyInterest.budget_currency}`
                  : null
              }
            />
            <DetailField
              label="Scholarship"
              value={studyInterest.scholarship_interest ? "Yes" : "No"}
            />
            <DetailField
              label="Qualification"
              value={studyInterest.highest_qualification || null}
            />
            <DetailField
              label="Language test"
              value={studyInterest.language_test_status || null}
            />
            {studyInterest.interest_notes ? (
              <DetailField
                label="Interest notes"
                value={studyInterest.interest_notes}
              />
            ) : null}
          </>
        ) : null}

        {lead.converted_applicant_id ? (
          // Keyed off the id, not `stage === "converted"` — reopening a
          // converted lead moves its stage to an active one but never clears the
          // conversion link, so the applicant reference must stay visible even
          // after reopen.
          <>
            <DetailField
              label="Converted"
              value={formatDateTime(lead.converted_at)}
            />
            <DetailField
              label="Converted by"
              value={
                lead.converted_by?.display_name ||
                lead.converted_by?.username ||
                null
              }
            />
            <DetailField
              label="Applicant"
              value={
                <Anchor
                  size="xs"
                  fw={500}
                  component={Link}
                  href={`/admin/applicants/${lead.converted_applicant_id}`}
                >
                  <Group gap={4} wrap="nowrap">
                    View applicant
                    <ArrowSquareOutIcon size={13} aria-hidden />
                  </Group>
                </Anchor>
              }
            />
          </>
        ) : null}

        {lead.stage === "lost" ? (
          <>
            <DetailField
              label="Lost reason"
              value={
                lead.lost_reason ? referenceEntryLabel(lead.lost_reason) : null
              }
            />
            {lead.lost_detail ? (
              <DetailField label="Lost detail" value={lead.lost_detail} />
            ) : null}
            <DetailField
              label="Closed at"
              value={formatDateTime(lead.lost_at)}
            />
            <DetailField
              label="Closed by"
              value={
                lead.lost_by?.display_name || lead.lost_by?.username || null
              }
            />
          </>
        ) : null}
      </SimpleGrid>
    </Stack>
  );
}

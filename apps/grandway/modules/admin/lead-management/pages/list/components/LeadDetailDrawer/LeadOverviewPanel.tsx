"use client";

import Link from "next/link";
import { Anchor, Badge, Box, Group, Stack, Text, dayjs } from "@peppermint/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import {
  STAGE_COLORS,
  STAGE_LABELS,
  categorizeLead,
} from "../../../../leadCategory.utils";
import type { LeadDetail } from "../../../../leadManagement.types";
import { referenceEntryLabel } from "../../../../referenceEntry.utils";
import { LeadStageSwitch } from "../LeadStageSwitch";
import { DetailField, DetailSection, LeadStudyProfile } from "./components";

function formatDateTime(value: string | null): string | null {
  return value ? dayjs(value).format("MMM D, YYYY h:mm A") : null;
}

/** The lead's phone numbers, primary first-class and labelled, one per line. */
function ContactNumbers({ lead }: { lead: LeadDetail }) {
  if (lead.contact_numbers.length === 0) return null;

  return (
    <Stack gap={4} align="flex-end">
      {lead.contact_numbers.map((c) => (
        <Group key={c.id ?? c.number} gap={6} wrap="nowrap">
          {c.is_primary ? (
            <Badge size="xs" variant="light" color="blue">
              Primary
            </Badge>
          ) : null}
          <Text size="xs" c="dimmed" tt="capitalize">
            {c.label}
          </Text>
          <Text size="xs" fw={500}>
            {c.number}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}

/**
 * The always-on body of the lead profile, a single narrow column: the stage
 * lever first — full width, larger, and the only interactive thing here — then
 * read-only fact grouped into labelled sections, so the eye lands on the one
 * decision before the detail. Study interest, academic background, language
 * tests and the outcome sections only exist when that data does; a section
 * never renders as an empty band.
 *
 * A deleted lead refuses every write (409 `LEADS_LEAD_DELETED`), so its stage
 * is shown as a fact (a badge), never as a lever.
 */
export function LeadOverviewPanel({ lead }: { lead: LeadDetail }) {
  const isDeleted = lead.deleted_at !== null;
  const followedUpBy =
    lead.last_followed_up_by?.display_name ||
    lead.last_followed_up_by?.username ||
    null;

  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Text size="xs" c="dimmed">
          Stage
        </Text>
        {isDeleted ? (
          <Badge
            variant="light"
            color={STAGE_COLORS[lead.stage]}
            style={{ alignSelf: "flex-start" }}
          >
            {STAGE_LABELS[lead.stage]}
          </Badge>
        ) : (
          <Box w="100%">
            <LeadStageSwitch
              lead={{ ...lead, category: categorizeLead(lead) }}
            />
          </Box>
        )}
      </Stack>

      <DetailSection title="Contact">
        <DetailField label="Email" value={lead.email} />
        <DetailField
          label="Phone"
          value={
            lead.contact_numbers.length === 0 ? null : (
              <ContactNumbers lead={lead} />
            )
          }
        />
        <DetailField label="Address" value={lead.address} />
      </DetailSection>

      <DetailSection title="Source & follow-up">
        <DetailField label="Source" value={referenceEntryLabel(lead.source)} />
        {lead.source_detail ? (
          <DetailField
            label="Source detail"
            value={lead.source_detail}
            stacked
          />
        ) : null}
        <DetailField
          label="Last follow-up"
          value={formatDateTime(lead.last_followed_up_at)}
        />
        <DetailField label="Followed up by" value={followedUpBy} />
      </DetailSection>

      <LeadStudyProfile lead={lead} />

      {lead.converted_applicant_id ? (
        // Keyed off the id, not `stage === "converted"` — reopening a converted
        // lead moves its stage to an active one but never clears the conversion
        // link, so the applicant reference must stay visible after reopen.
        <DetailSection title="Conversion">
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
        </DetailSection>
      ) : null}

      {lead.stage === "lost" ? (
        <DetailSection title="Closed">
          <DetailField
            label="Lost reason"
            value={
              lead.lost_reason ? referenceEntryLabel(lead.lost_reason) : null
            }
          />
          {lead.lost_detail ? (
            <DetailField label="Lost detail" value={lead.lost_detail} stacked />
          ) : null}
          <DetailField label="Closed at" value={formatDateTime(lead.lost_at)} />
          <DetailField
            label="Closed by"
            value={lead.lost_by?.display_name || lead.lost_by?.username || null}
          />
        </DetailSection>
      ) : null}
    </Stack>
  );
}

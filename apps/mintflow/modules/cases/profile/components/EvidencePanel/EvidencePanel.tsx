"use client";

import {
  Badge,
  Box,
  Button,
  Group,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import {
  actorLabel,
  formatGregorian,
  useActorDirectory,
  type EvidenceStatus,
} from "@/lib/work";
import { tokens } from "@/config/design";
import { useEvidence } from "../../CaseProfile.hooks";
import { useRejectEvidence, useVerifyEvidence } from "../../../cases.mutations";
import { EvidenceModal } from "./EvidenceModal";
import type { EvidencePanelProps } from "./EvidencePanel.types";

const STATUS_COLOR: Record<EvidenceStatus, string> = {
  submitted: "blue",
  pending_verification: "yellow",
  verified: "green",
  rejected: "red",
  superseded: "gray",
  invalid: "gray",
};

const RESOLVABLE: ReadonlySet<EvidenceStatus> = new Set([
  "submitted",
  "pending_verification",
]);

function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function EvidencePanel({ workId }: EvidencePanelProps) {
  const query = useEvidence(workId, true);
  const verify = useVerifyEvidence(workId);
  const reject = useRejectEvidence(workId);
  const [modalOpened, modal] = useDisclosure(false);

  const evidence = query.data ?? [];
  const actorDir = useActorDirectory(evidence.map((e) => e.submitted_by));
  const pending = verify.isPending || reject.isPending;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text fz="13px" fw={600} c={tokens.muted2}>
          Evidence · {query.isLoading ? "…" : evidence.length}
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<PlusIcon size={14} aria-label="Submit evidence" />}
          onClick={modal.open}
        >
          Submit
        </Button>
      </Group>

      {query.isLoading ? (
        <Stack gap={8}>
          <Skeleton height={64} radius="md" />
          <Skeleton height={64} radius="md" />
        </Stack>
      ) : query.isError ? (
        <Group gap="sm">
          <Text fz="sm" c={tokens.muted2}>
            Couldn&apos;t load evidence.
          </Text>
          <Button
            size="compact-xs"
            variant="subtle"
            onClick={() => query.refetch()}
          >
            Retry
          </Button>
        </Group>
      ) : evidence.length === 0 ? (
        <Text fz="sm" c="dimmed" ta="center" py="lg">
          No evidence submitted yet.
        </Text>
      ) : (
        <Stack gap={8}>
          {evidence.map((e) => (
            <Box
              key={e.id}
              p={12}
              style={{
                borderRadius: 12,
                border: `1px solid ${tokens.line}`,
              }}
            >
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Box style={{ minWidth: 0 }}>
                  <Text fz="14px" fw={600} c={tokens.ink} lineClamp={1}>
                    {e.title}
                  </Text>
                  <Text fz="12px" c={tokens.muted} mt={2}>
                    {humanize(e.evidence_type)} ·{" "}
                    {actorLabel(e.submitted_by, actorDir)} ·{" "}
                    {formatGregorian(e.submitted_at)}
                  </Text>
                </Box>
                <Badge
                  color={STATUS_COLOR[e.verification_status]}
                  variant="light"
                  radius="sm"
                  size="sm"
                  style={{ flexShrink: 0 }}
                >
                  {humanize(e.verification_status)}
                </Badge>
              </Group>

              {e.text_payload || e.external_reference ? (
                <Text fz="13px" c={tokens.muted2} mt={8} lineClamp={2}>
                  {e.text_payload || e.external_reference}
                </Text>
              ) : null}

              {RESOLVABLE.has(e.verification_status) ? (
                <Group gap="xs" mt={10}>
                  <Button
                    size="compact-xs"
                    variant="light"
                    color="green"
                    loading={pending}
                    onClick={() => verify.mutate(e.id)}
                  >
                    Verify
                  </Button>
                  <Button
                    size="compact-xs"
                    variant="light"
                    color="red"
                    loading={pending}
                    onClick={() => reject.mutate(e.id)}
                  >
                    Reject
                  </Button>
                </Group>
              ) : null}
            </Box>
          ))}
        </Stack>
      )}

      <EvidenceModal
        workId={workId}
        opened={modalOpened}
        onClose={modal.close}
      />
    </Stack>
  );
}

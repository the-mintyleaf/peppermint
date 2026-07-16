"use client";

import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { useParams, useRouter } from "next/navigation";
import { Box, Group, Stack, Text, UnstyledButton } from "@peppermint/ui";

import { CheckItem, MonoText, Screen, StatusPill } from "@/components";
import { tokens } from "@/config/design";

import {
  LocationChip,
  OwnerCard,
  PersonChip,
  TrailNode,
  TrailStage,
} from "./components";
import { workTrail } from "./WorkTrail.data";
import type { StageMeta } from "./WorkTrail.types";

const muted = "rgba(0,0,0,0.42)";
const accent = "rgb(238,87,41)";
const blue = "rgb(44,110,202)";

/**
 * Work Trail — the vertical case-timeline screen for a single case (Files ›
 * `/files/[caseId]/trail`). Static mock: a fixed six-stage trail, so async
 * loading / empty / error states are N/A (see WorkTrail.data.ts).
 */
export function ModuleWorkTrail() {
  const router = useRouter();
  const params = useParams<{ caseId?: string }>();
  const { case: kase, stages, owners, subtasks, approver } = workTrail;
  const caseLabel = params?.caseId ? `CASE #${params.caseId}` : kase.number;

  return (
    <Screen>
      <Stack gap={18}>
        <Group align="center" gap={14} wrap="nowrap">
          <UnstyledButton
            onClick={() => router.back()}
            aria-label="Go back"
            style={{
              width: 36,
              height: 36,
              flex: "0 0 auto",
              border: "1px solid rgba(0,0,0,0.14)",
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CaretLeftIcon size={18} weight="bold" color={tokens.ink} />
          </UnstyledButton>
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <MonoText label fz="10px" fw={600} c={muted}>
              {caseLabel}
            </MonoText>
            <Text
              fz="18px"
              fw={700}
              truncate
              style={{ letterSpacing: "-0.3px" }}
            >
              {kase.title}
            </Text>
          </Stack>
          <StatusPill mono fg={kase.status.fg} bg={kase.status.bg} fz="10px">
            {kase.status.label}
          </StatusPill>
        </Group>

        <Group
          gap={18}
          wrap="wrap"
          style={{
            borderBottom: `1px solid ${tokens.line}`,
            paddingBottom: 14,
          }}
        >
          <Group gap={8} wrap="nowrap">
            <Box style={{ width: 20, height: 2, background: tokens.ink }} />
            <MonoText label fz="10px" fw={600} c={muted}>
              CONFIRMED
            </MonoText>
          </Group>
          <Group gap={8} wrap="nowrap">
            <Box
              style={{ width: 20, borderTop: "2px dotted rgba(0,0,0,0.4)" }}
            />
            <MonoText label fz="10px" fw={600} c={muted}>
              HANDOFF / PENDING
            </MonoText>
          </Group>
        </Group>

        <Box>
          {/* Stage 1 — CREATED */}
          <TrailStage
            connector="solid"
            connectorColor={tokens.green}
            node={
              <TrailNode background={tokens.green}>
                <CheckIcon size={12} weight="bold" color="#fff" />
              </TrailNode>
            }
          >
            <Stack gap={8}>
              <StageHead meta={stages.created} />
              <Group gap={8} wrap="wrap">
                <PersonChip person={workTrail.creator} />
                <LocationChip label={workTrail.createdLocation} />
              </Group>
            </Stack>
          </TrailStage>

          {/* Stage 2 — ASSIGNED */}
          <TrailStage
            connector="solid"
            connectorColor={tokens.green}
            node={
              <TrailNode background={tokens.green}>
                <UserIcon size={12} weight="fill" color="#fff" />
              </TrailNode>
            }
          >
            <Stack gap={10}>
              <StageHead meta={stages.assigned} />
              <Box style={{ position: "relative", paddingLeft: 20 }}>
                <Box
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 4,
                    bottom: 14,
                    borderLeft: "2px dotted rgba(0,0,0,0.2)",
                  }}
                />
                <Stack gap={10}>
                  {owners.map((o) => (
                    <OwnerCard
                      key={o.name}
                      name={o.name}
                      role={o.role}
                      initials={o.initials}
                      color={o.color}
                      border="1px solid rgba(0,0,0,0.08)"
                      background="#fff"
                      stub
                      right={
                        <StatusPill mono fg={o.tag.fg} bg={o.tag.bg} px={8}>
                          {o.tag.label}
                        </StatusPill>
                      }
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </TrailStage>

          {/* Stage 3 — IN PROGRESS */}
          <TrailStage
            connector="dotted"
            connectorColor={accent}
            node={
              <TrailNode
                background="#fff"
                boxShadow="0 0 0 2px rgb(238,87,41),0 0 0 5px rgba(238,87,41,0.18)"
              >
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: accent,
                  }}
                />
              </TrailNode>
            }
          >
            <Stack gap={12}>
              <StageHead meta={stages.progress} />
              <Box
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {subtasks.map((t, i) => (
                  <Box
                    key={t.id}
                    style={{
                      padding: "12px 14px",
                      borderTop:
                        i === 0 ? undefined : `1px solid ${tokens.line}`,
                    }}
                  >
                    <CheckItem
                      title={t.title}
                      done={t.done}
                      ring={t.ring}
                      fill={t.ring}
                      ringSize={20}
                      right={
                        <MonoText fz="10px" c={muted}>
                          {t.who}
                        </MonoText>
                      }
                    />
                  </Box>
                ))}
              </Box>
              <LocationChip label={workTrail.progressLocation} />
            </Stack>
          </TrailStage>

          {/* Stage 4 — APPROVAL SENT */}
          <TrailStage
            connector="dotted"
            connectorColor={blue}
            node={
              <TrailNode background={blue}>
                <PaperPlaneTiltIcon size={12} weight="fill" color="#fff" />
              </TrailNode>
            }
          >
            <Stack gap={10}>
              <StageHead meta={stages.approvalSent} />
              <OwnerCard
                name={approver.name}
                role={approver.role}
                initials={approver.initials}
                color={approver.color}
                border="1px dashed rgba(44,110,202,0.4)"
                background="rgba(44,110,202,0.05)"
                right={
                  <MonoText fz="10px" fw={600} c={blue}>
                    WAITING
                  </MonoText>
                }
              />
            </Stack>
          </TrailStage>

          {/* Stage 5 — APPROVED */}
          <TrailStage
            connector="dotted"
            connectorColor="rgba(0,0,0,0.25)"
            node={
              <TrailNode
                background={tokens.paper}
                border="2px solid rgba(0,0,0,0.2)"
              >
                <CheckIcon size={11} weight="bold" color="rgba(0,0,0,0.25)" />
              </TrailNode>
            }
          >
            <StageHead meta={stages.approved} />
          </TrailStage>

          {/* Stage 6 — COMPLETED (no connector after) */}
          <TrailStage
            connector="none"
            node={
              <TrailNode
                background={tokens.paper}
                border="2px solid rgba(0,0,0,0.2)"
              >
                <PlusIcon size={11} weight="bold" color="rgba(0,0,0,0.35)" />
              </TrailNode>
            }
          >
            <StageHead meta={stages.completed} />
          </TrailStage>
        </Box>
      </Stack>
    </Screen>
  );
}

function StageHead({ meta }: { meta: StageMeta }) {
  return (
    <Stack gap={6}>
      <MonoText label fz="10px" fw={600} c={meta.labelColor}>
        {meta.label}
      </MonoText>
      <Text
        fz="15px"
        fw={700}
        style={{
          letterSpacing: "-0.3px",
          color: meta.titleMuted ? "rgba(0,0,0,0.4)" : tokens.ink,
        }}
      >
        {meta.title}
      </Text>
    </Stack>
  );
}

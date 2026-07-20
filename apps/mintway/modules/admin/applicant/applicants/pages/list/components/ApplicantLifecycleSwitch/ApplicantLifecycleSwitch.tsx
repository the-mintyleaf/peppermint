"use client";

import { useState } from "react";
import { Menu } from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import { DotIcon } from "@phosphor-icons/react/dist/csr/Dot";

import { StatusSwitchButton } from "@/components/StatusSwitchButton";
import {
  ENGAGEMENT_STATUS_COLORS,
  ENGAGEMENT_STATUS_LABELS,
  engagementTargets,
  FORWARD_STAGES,
  LIFECYCLE_STAGE_COLORS,
  LIFECYCLE_STAGE_LABELS,
} from "../../../../../_shared";
import type { EngagementStatus, LifecycleStage } from "../../../../../_shared";
import { TransitionModal } from "../../../../components/ApplicantActions";
import type { ApplicantLifecycleSwitchProps } from "./ApplicantLifecycleSwitch.types";

/**
 * The Stage / Engagement cell. For an admin on a live record it becomes a status switch
 * (the shared pale-pill look): picking a target opens the lifecycle modal pre-filled with
 * that choice, so the reason/assessment rules still apply before anything is written.
 * Staff and archived/merged records fall back to a plain read-only badge — the lever never
 * appears where the server would reject the change. A live record already at the final
 * stage keeps the switch pill but shows a check with a disabled dropdown (nothing forward).
 */
export function ApplicantLifecycleSwitch({
  applicant,
  field,
  isAdmin,
}: ApplicantLifecycleSwitchProps) {
  const [target, setTarget] = useState<string>();

  const isStage = field === "stage";
  const current = isStage
    ? applicant.lifecycle_stage
    : applicant.engagement_status;
  const labels: Record<string, string> = isStage
    ? LIFECYCLE_STAGE_LABELS
    : ENGAGEMENT_STATUS_LABELS;
  const colors: Record<string, string> = isStage
    ? LIFECYCLE_STAGE_COLORS
    : ENGAGEMENT_STATUS_COLORS;
  const targets: string[] = isStage
    ? FORWARD_STAGES[applicant.lifecycle_stage]
    : engagementTargets(applicant.engagement_status);

  const badge = (
    <StatusBadge value={current} colorMap={colors} labelMap={labels} />
  );

  // No lever for staff or terminal records (archived or merged — the server rejects a
  // transition on either, matching ApplicantActionBar's `isTerminal`). A live record with
  // nowhere forward to go (the final "Applicant" stage) keeps the switch look for row
  // consistency but reads as a settled status: a check mark instead of the caret, with the
  // dropdown disabled so it can't be opened.
  if (!isAdmin || applicant.archived_at || applicant.merged_into) return badge;

  const isTerminal = targets.length === 0;

  // `target` drives everything: setting it mounts the modal (seeded from the pick via
  // useState initializers); clearing it on close unmounts. No modal tree — and no idle
  // mutation — is mounted for a closed switch, and re-picking the same target still
  // remounts because it transitions from `undefined`.
  const openWith = (value: string) => setTarget(value);

  return (
    <>
      <Menu position="bottom-start" withinPortal disabled={isTerminal}>
        <Menu.Target>
          <StatusSwitchButton
            fullWidth
            terminal={isTerminal}
            label={labels[current] ?? current}
            color={colors[current] ?? "gray"}
            aria-label={
              isTerminal
                ? `${isStage ? "Stage" : "Engagement"} for ${applicant.full_name}: ${labels[current] ?? current} — final ${isStage ? "stage" : "status"}, no change available`
                : `Change ${isStage ? "stage" : "engagement"} for ${applicant.full_name}, currently ${labels[current] ?? current}`
            }
          />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>
            {isStage ? "Move to stage" : "Set engagement"}
          </Menu.Label>
          {targets.map((t) => (
            <Menu.Item
              key={t}
              leftSection={
                <DotIcon
                  size={12}
                  color={`var(--mantine-color-${colors[t] ?? "gray"}-6)`}
                  weight="fill"
                  aria-hidden
                />
              }
              onClick={() => openWith(t)}
            >
              {labels[t] ?? t}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      {target !== undefined && (
        <TransitionModal
          applicant={applicant}
          opened
          onClose={() => setTarget(undefined)}
          initialStage={isStage ? (target as LifecycleStage) : undefined}
          initialEngagement={isStage ? undefined : (target as EngagementStatus)}
        />
      )}
    </>
  );
}

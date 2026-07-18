"use client";

import {
  Avatar,
  Box,
  Group,
  SegmentedControl,
  Stack,
  Text,
} from "@peppermint/ui";

import { tokens } from "@/config/design";
import { ActivityTimeline } from "../ActivityTimeline";
import type { CaseView } from "../../caseView";
import type { WorkTab } from "../../CaseProfile.hooks";
import type { WorkTabsProps } from "./WorkTabs.types";

function PeoplePanel({ view }: { view: CaseView }) {
  if (view.people.length === 0) {
    return (
      <Text fz="sm" c="dimmed" ta="center" py="xl">
        No people assigned to this case yet.
      </Text>
    );
  }
  return (
    <Stack gap={8}>
      {view.people.map((person) => (
        <Group
          key={person.id}
          gap={13}
          wrap="nowrap"
          px={14}
          py={12}
          style={{ borderRadius: 13, border: `1px solid ${tokens.line}` }}
        >
          <Avatar
            color={person.color}
            radius="xl"
            size={36}
            styles={{ placeholder: { fontSize: 12, fontWeight: 700 } }}
          >
            {person.initials}
          </Avatar>
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text fz="14px" fw={600} c={tokens.ink} truncate>
              {person.name}
            </Text>
            <Text fz="12px" fw={500} mt={2} c={tokens.muted}>
              {person.role}
            </Text>
          </Box>
        </Group>
      ))}
    </Stack>
  );
}

/**
 * Activity / People tab strip. Activity is the default — the question the card
 * answers: "what's happening on this case?" (Attachments & Evidence tabs arrive
 * in a later phase.)
 */
export function WorkTabs({
  view,
  activity,
  tab,
  onTabChange,
  filterLabel,
  onClearFilter,
}: WorkTabsProps) {
  const data = [
    { value: "activity" satisfies WorkTab, label: "Activity" },
    {
      value: "people" satisfies WorkTab,
      label: `People · ${view.people.length}`,
    },
  ];

  return (
    <Stack gap={22}>
      <SegmentedControl
        fullWidth
        value={tab}
        onChange={(v) => onTabChange(v as WorkTab)}
        data={data}
        radius="md"
      />
      {tab === "activity" ? (
        <ActivityTimeline
          view={view}
          events={activity}
          filterLabel={filterLabel}
          onClearFilter={onClearFilter}
        />
      ) : null}
      {tab === "people" ? <PeoplePanel view={view} /> : null}
    </Stack>
  );
}

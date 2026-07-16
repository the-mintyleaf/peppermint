"use client";

import {
  Avatar,
  Box,
  Group,
  SegmentedControl,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";
import { ActivityTimeline } from "../ActivityTimeline";
import { FILE_STYLE } from "../../profile.api";
import type { CaseFile, WorkCase } from "../../profile.api";
import type { WorkTab } from "../../CaseProfile.hooks";
import type { WorkTabsProps } from "./WorkTabs.types";

function FilesPanel({ files }: { files: CaseFile[] }) {
  if (files.length === 0) {
    return (
      <Text fz="sm" c="dimmed" ta="center" py="xl">
        No documents filed against this case yet.
      </Text>
    );
  }
  return (
    <Stack gap={8}>
      {files.map((f) => {
        const style = FILE_STYLE[f.kind];
        return (
          <UnstyledButton
            key={f.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "12px 14px",
              borderRadius: 13,
              border: `1px solid ${tokens.line}`,
            }}
          >
            <Box
              w={36}
              h={36}
              style={{
                borderRadius: 9,
                background: style.bg,
                color: style.fg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MonoText fz="10px" fw={700} c={style.fg}>
                {f.ext}
              </MonoText>
            </Box>
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Text fz="14px" fw={600} c={tokens.ink} truncate>
                {f.name}
              </Text>
              <MonoText fz="12px" fw={500} mt={2} c={tokens.muted}>
                {style.type} · {f.size} · {f.modified}
              </MonoText>
            </Box>
            <Avatar
              color={f.owner.color}
              radius="xl"
              size={26}
              styles={{ placeholder: { fontSize: 9, fontWeight: 700 } }}
            >
              {f.owner.initials}
            </Avatar>
            <DownloadSimpleIcon
              size={16}
              color={tokens.muted}
              aria-label={`Download ${f.name}`}
            />
          </UnstyledButton>
        );
      })}
    </Stack>
  );
}

function PeoplePanel({ workCase }: { workCase: WorkCase }) {
  return (
    <Stack gap={8}>
      {workCase.officers.map((officer) => (
        <Group
          key={officer.id}
          gap={13}
          wrap="nowrap"
          px={14}
          py={12}
          style={{ borderRadius: 13, border: `1px solid ${tokens.line}` }}
        >
          <Avatar
            color={officer.color}
            radius="xl"
            size={36}
            styles={{ placeholder: { fontSize: 12, fontWeight: 700 } }}
          >
            {officer.initials}
          </Avatar>
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text fz="14px" fw={600} c={tokens.ink} truncate>
              {officer.name}
            </Text>
            <Text fz="12px" fw={500} mt={2} c={tokens.muted}>
              {officer.role}
            </Text>
          </Box>
        </Group>
      ))}
    </Stack>
  );
}

/**
 * Activity / Files / People tab strip. Activity is the default — the question
 * the card answers: "what's happening on this case?"
 */
export function WorkTabs({
  workCase,
  files,
  activity,
  tab,
  onTabChange,
  filterLabel,
  onClearFilter,
}: WorkTabsProps) {
  const data = [
    { value: "activity" satisfies WorkTab, label: "Activity" },
    { value: "files" satisfies WorkTab, label: `Files · ${files.length}` },
    {
      value: "people" satisfies WorkTab,
      label: `People · ${workCase.officers.length}`,
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
          workCase={workCase}
          events={activity}
          filterLabel={filterLabel}
          onClearFilter={onClearFilter}
        />
      ) : null}
      {tab === "files" ? <FilesPanel files={files} /> : null}
      {tab === "people" ? <PeoplePanel workCase={workCase} /> : null}
    </Stack>
  );
}

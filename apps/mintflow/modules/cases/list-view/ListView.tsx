"use client";

import { Box, Stack } from "@peppermint/ui";

import { useActorDirectory, useUnitDirectory } from "@/lib/work";
import { SectionLabel } from "@/components";
import { tokens } from "@/config/design";
import { CaseRow } from "./components/CaseRow";
import type { ListViewProps } from "./ListView.types";
import classes from "./ListView.module.css";

const CASE_HEADERS = ["Case", "Status", "Priority", "Unit", "Owner", "Due", ""];

const cardStyle = {
  background: tokens.paper,
  border: `1px solid ${tokens.line}`,
  borderRadius: tokens.radius.card,
  overflow: "hidden",
} as const;

export function ListView({ cases, onOpenCase }: ListViewProps) {
  const actorDir = useActorDirectory(cases.map((c) => c.current_owner));
  const unitDir = useUnitDirectory(cases.map((c) => c.responsible_unit));

  return (
    <Stack gap="xl" p="md">
      <Stack gap="sm">
        <SectionLabel>Cases · {cases.length}</SectionLabel>
        <Box style={cardStyle}>
          <div className={classes.scroll}>
            <div className={classes.table}>
              <div className={`${classes.caseGrid} ${classes.header}`}>
                {CASE_HEADERS.map((label, i) => (
                  <span key={i} className={classes.headerLabel}>
                    {label}
                  </span>
                ))}
              </div>
              {cases.map((c) => (
                <CaseRow
                  key={c.id}
                  workCase={c}
                  onOpen={onOpenCase}
                  actorDir={actorDir}
                  unitDir={unitDir}
                />
              ))}
            </div>
          </div>
        </Box>
      </Stack>
    </Stack>
  );
}

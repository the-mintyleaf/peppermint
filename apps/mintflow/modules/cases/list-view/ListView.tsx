"use client";

import { Box } from "@peppermint/ui";

import { tokens } from "@/config/design";
import { CaseFileRow } from "./components/CaseFileRow";
import type { ListViewProps } from "./ListView.types";
import classes from "./ListView.module.css";

const HEADERS = ["Name", "Type", "Size", "Modified", "Shared with", ""];

export function ListView({ rows, onOpenRow }: ListViewProps) {
  return (
    <Box p="md">
      <Box
        style={{
          background: tokens.paper,
          border: `1px solid ${tokens.line}`,
          borderRadius: tokens.radius.card,
          overflow: "hidden",
        }}
      >
        <div className={`${classes.grid} ${classes.header}`}>
          {HEADERS.map((label, i) => (
            <span key={i} className={classes.headerLabel}>
              {label}
            </span>
          ))}
        </div>

        {rows.map((row) => (
          <CaseFileRow key={row.id} row={row} onOpen={onOpenRow} />
        ))}
      </Box>
    </Box>
  );
}

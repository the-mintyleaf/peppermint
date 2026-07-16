"use client";

import { ActionIcon, Avatar, Menu } from "@peppermint/ui";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";

import { CaseIcon, MonoText } from "@/components";
import type { CaseFileRowProps } from "./CaseFileRow.types";
import classes from "../../ListView.module.css";

export function CaseFileRow({ row, onOpen }: CaseFileRowProps) {
  return (
    <div
      className={`${classes.grid} ${classes.row}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(row)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(row);
        }
      }}
    >
      {/* Name + leading icon */}
      <div className={classes.nameCell}>
        {row.kind === "case" && row.caseIcon ? (
          <CaseIcon
            kind={row.caseIcon}
            color={row.iconColor}
            tint={row.iconTint}
            size={30}
            radius={8}
            iconSize={16}
          />
        ) : (
          <span
            className={classes.glyphBox}
            style={{ background: row.iconTint, color: row.iconColor }}
          >
            {row.glyph}
          </span>
        )}
        <span className={classes.nameText}>{row.name}</span>
      </div>

      <span className={classes.metaText}>{row.type}</span>
      <MonoText className={classes.metaText}>{row.size}</MonoText>
      <MonoText className={classes.metaText}>{row.modified}</MonoText>

      <div className={classes.peopleCell}>
        <Avatar.Group spacing="sm">
          {row.people.slice(0, 3).map((p) => (
            <Avatar key={p.id} size={24} radius="xl" color={p.color}>
              {p.initials}
            </Avatar>
          ))}
        </Avatar.Group>
      </div>

      <div className={classes.actionCell}>
        <Menu shadow="sm" width={160} position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={`${row.name} actions`}
              onClick={(e) => e.stopPropagation()}
            >
              <DotsThreeIcon size={18} weight="bold" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
            <Menu.Item onClick={() => onOpen(row)}>
              Open {row.kind === "case" ? "case" : "file"}
            </Menu.Item>
            <Menu.Item>Rename</Menu.Item>
            <Menu.Item>Share</Menu.Item>
            <Menu.Item color="red">Delete</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}

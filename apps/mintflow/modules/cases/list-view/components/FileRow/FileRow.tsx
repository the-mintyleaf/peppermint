"use client";

import { ActionIcon, Avatar, Group, Menu, Text } from "@peppermint/ui";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";

import { StatusPill } from "@/components";
import { notConnected } from "../../../Cases.hooks";
import { FILE_STYLE } from "../../../module.api";
import type { FileRowProps } from "./FileRow.types";
import classes from "../../ListView.module.css";

export function FileRow({ file, onOpen }: FileRowProps) {
  const style = FILE_STYLE[file.kind];

  return (
    <div
      className={`${classes.fileGrid} ${classes.row}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(file)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(file);
        }
      }}
    >
      {/* Name */}
      <div className={classes.identity}>
        <span className={classes.glyphBox} style={{ background: style.bg }}>
          <FileTextIcon size={17} color={style.fg} />
        </span>
        <span className={classes.nameText}>{file.name}</span>
      </div>

      {/* Type */}
      <div>
        <StatusPill fg={style.fg} bg={style.bg}>
          {style.type}
        </StatusPill>
      </div>

      {/* Related case */}
      <span className={classes.mono}>{file.caseNumber}</span>

      {/* Size */}
      <span className={classes.mono}>{file.size}</span>

      {/* Modified + owner */}
      <Group gap={7} wrap="nowrap" align="center">
        <Text className={classes.metaText}>{file.modified}</Text>
        <Avatar size={22} radius="xl" color={file.owner.color}>
          {file.owner.initials}
        </Avatar>
      </Group>

      {/* Actions */}
      <div className={classes.actionCell}>
        <Menu shadow="sm" width={160} position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={`${file.name} actions`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <DotsThreeIcon size={18} weight="bold" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
            <Menu.Item onClick={() => onOpen(file)}>Open document</Menu.Item>
            <Menu.Item onClick={notConnected}>Download</Menu.Item>
            <Menu.Item onClick={notConnected}>Share</Menu.Item>
            <Menu.Item color="red" onClick={notConnected}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}

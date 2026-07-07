"use client";

import { Handle, Position } from "@xyflow/react";
import { Badge, Group, Stack, Text } from "@peppermint/ui";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";

import styles from "../../../Structure.module.css";
import type { MemberNodeData } from "../../../Structure.types";
import type { MemberNodeProps } from "./MemberNode.types";

export function MemberNode({ data }: MemberNodeProps) {
  const member = data as MemberNodeData;

  return (
    <div
      className={`${styles.node} ${styles.memberNode} ${member._dimmed ? styles.nodeDimmed : ""} ${member._pathHighlighted ? styles.nodePathHighlight : ""} ${member._searchMatch ? styles.nodeSearchMatch : ""}`}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <Group gap="xs" wrap="nowrap" align="center" p="xs">
        <UserIcon size={16} aria-hidden />
        <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" fw={600} truncate>
            {member.displayName}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            @{member.username}
            {member.membershipType ? ` · ${member.membershipType}` : ""}
          </Text>
        </Stack>
        {member.isPrimary && (
          <Badge size="xs" color="violet" variant="light">
            Primary
          </Badge>
        )}
      </Group>
    </div>
  );
}

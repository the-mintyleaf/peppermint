"use client";

import { Group, Text, UnstyledButton } from "@peppermint/ui";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Structure", segment: "structure" },
  { label: "Positions", segment: "positions" },
  { label: "Members", segment: "members" },
  { label: "Sites", segment: "sites" },
  { label: "Delegations", segment: "delegations" },
  { label: "Event Log", segment: "event-log" },
] as const;

export function OrgNav() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const orgId = params?.id ?? "";

  return (
    <Group
      gap={0}
      style={{
        borderBottom: "1px solid var(--mantine-color-default-border)",
        paddingLeft: "var(--mantine-spacing-md)",
      }}
    >
      {NAV_ITEMS.map(({ label, segment }) => {
        const href = `/admin/organization/${orgId}/${segment}`;
        const isActive = pathname.includes(`/${segment}`);

        return (
          <UnstyledButton
            key={segment}
            component={Link}
            href={href}
            style={{
              padding: "10px 16px",
              borderBottom: isActive
                ? "2px solid var(--mantine-color-brand-6)"
                : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            <Text
              size="sm"
              fw={isActive ? 600 : 400}
              c={isActive ? "brand" : "dimmed"}
            >
              {label}
            </Text>
          </UnstyledButton>
        );
      })}
    </Group>
  );
}

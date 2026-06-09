"use client";

import { Badge, Group, Stack, Text, UnstyledButton } from "@zetsel/ui";
import type { AdminShellNavGroup } from "../../../AdminShell.types";

interface SubNavLinksProps {
  groups: AdminShellNavGroup[];
  pathname: string;
}

export function SubNavLinks({ groups, pathname }: SubNavLinksProps) {
  return (
    <>
      {groups.map((group) => (
        <Stack key={group.label} gap={0} mb={4}>
          <Text
            my="xs"
            size="10px"
            fw={300}
            tt="uppercase"
            c="gray.4"
            px="md"
            
            pb={4}
            style={{ letterSpacing: "0.08em" }}
          >
            {group.label}
          </Text>

          {group.items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <UnstyledButton
                key={item.href}
                component="a"
                href={item.href}
                px="sm"
                py={6}
                mx={4}
                style={{
                  borderRadius: "var(--mantine-radius-sm)",
                  backgroundColor: isActive
                    ? "transparent"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: isActive
                    ? "var(--mantine-color-gray-0)"
                    : "var(--mantine-color-gray-7)",
                }}
              >
                {Icon && (
                  <Icon
                    size={14}
                    weight="duotone"
                    aria-hidden
                    style={{ flexShrink: 0 }}
                  />
                )}
                <Group justify="space-between" style={{ flex: 1 }}>
                  <Text size="sm" fw={400} style={{ color: "inherit" }}>
                    {item.label}
                  </Text>
                  {item.badge && (
                    <Badge size="xs" color="teal.4">
                      {item.badge}
                    </Badge>
                  )}
                </Group>
              </UnstyledButton>
            );
          })}
        </Stack>
      ))}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Group, Loader, Menu, Text, UnstyledButton } from "@peppermint/ui";
import { CaretUpDownIcon } from "@phosphor-icons/react/dist/csr/CaretUpDown";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { fetchOrganizations } from "@/modules/admin/organization/organizations/organizations.api";
import { organizationsQueryKeys } from "@/modules/admin/organization/organizations/organizations.queryKeys";
import { useSelectedOrgStore } from "@/stores/selectedOrg.store";
import type { Organization } from "@/modules/admin/organization/organizations/organizations.types";

export function OrgSwitcherWidget() {
  const router = useRouter();
  const { org, setOrg } = useSelectedOrgStore();
  const [pendingOrgId, setPendingOrgId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: organizationsQueryKeys.list(),
    queryFn: () => fetchOrganizations(),
  });

  const orgs = data?.data ?? [];

  const handleSelect = (selected: Organization) => {
    if (selected.id === org?.id) return;
    setPendingOrgId(selected.id);
    setOrg({
      id: selected.id,
      name: selected.name,
      code: selected.code,
      status: selected.status,
      country_code: selected.country_code,
    });
    router.push(`/admin/organization/${selected.id}/structure`);
  };

  if (!org) return null;

  const isNavigating = pendingOrgId !== null;

  return (
    <>
      <Text size="xs" c="gray.6" mb="xs">
        Selected Node.
      </Text>
      <Menu withArrow shadow="md" width={220} position="right-start" withinPortal>
        <Menu.Target>
          <UnstyledButton disabled={isNavigating}>
            <Group gap={4} wrap="nowrap" align="flex-start">
              <Text size="lg" fw={600} c={isNavigating ? "gray.5" : "gray.1"}>
                {org.name}
              </Text>
              {isNavigating ? (
                <Loader size={13} color="gray.5" style={{ marginTop: 10 }} />
              ) : (
                <CaretUpDownIcon
                  size={13}
                  aria-hidden
                  style={{ color: "var(--mantine-color-gray-0)", marginTop: 10 }}
                />
              )}
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Switch organization</Menu.Label>
          {orgs.map((o) => {
            const isActive = o.id === org.id;
            const isPending = o.id === pendingOrgId;
            return (
              <Menu.Item
                key={o.id}
                onClick={() => handleSelect(o)}
                disabled={isNavigating}
                leftSection={
                  isPending ? (
                    <Loader size={12} />
                  ) : isActive ? (
                    <CheckIcon weight="bold" size={12} aria-hidden />
                  ) : (
                    ""
                  )
                }
              >
                <Text
                  size="xs"
                  fw={isActive ? 600 : 400}
                  c={isPending ? "dimmed" : isActive ? "brand" : undefined}
                >
                  {o.name}
                </Text>
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>
    </>
  );
}

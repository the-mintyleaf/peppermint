"use client";

import {
  Accordion,
  Badge,
  Center,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { ShieldWarningIcon } from "@phosphor-icons/react/dist/csr/ShieldWarning";
import type { PolicyPermission } from "@/modules/admin/authenticate/_shared/policyTree.types";
import { usePermissionCatalog } from "./PermissionCatalogPanel.hooks";

const RISK_COLOR: Record<PolicyPermission["risk_level"], string> = {
  low: "gray",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

export function PermissionCatalogPanel() {
  const {
    apps,
    isLoadingApps,
    isLoadingTree,
    appFilter,
    setAppFilter,
    search,
    setSearch,
    tree,
  } = usePermissionCatalog();

  const appOptions = apps.map((app) => ({
    value: app.key,
    label: app.display_name,
  }));

  const isLoading = isLoadingApps || isLoadingTree;
  const hasResults = tree.some((appTree) => appTree.groups.length > 0);

  return (
    <Stack gap="md" p="md">
      <Group gap="sm" wrap="wrap" align="flex-end">
        <Select
          label="App"
          placeholder="All apps"
          clearable
          searchable
          disabled={isLoadingApps}
          data={appOptions}
          value={appFilter}
          onChange={setAppFilter}
          w={260}
        />
        <TextInput
          label="Search"
          placeholder="Filter by key or label"
          leftSection={<MagnifyingGlassIcon size={16} aria-label="Search" />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={320}
        />
      </Group>

      {isLoading ? (
        <Center h={240}>
          <Loader size="sm" />
        </Center>
      ) : !hasResults ? (
        <Center h={240}>
          <Stack align="center" gap="xs">
            <ShieldWarningIcon size={28} aria-label="No permissions found" />
            <Text size="sm" c="dimmed">
              No permissions match your filters.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Accordion multiple variant="separated">
          {tree.map((appTree) => (
            <Accordion.Item key={appTree.app} value={appTree.app}>
              <Accordion.Control>
                <Text fw={600} size="sm">
                  {appTree.app}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  {appTree.groups.map((group) => (
                    <Stack key={group.key} gap="xs">
                      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                        {group.label}
                      </Text>
                      <Stack gap="xs">
                        {group.permissions.map((permission) => (
                          <Paper
                            key={permission.key}
                            withBorder
                            radius="sm"
                            p="xs"
                          >
                            <Stack gap={4}>
                              <Group
                                justify="space-between"
                                wrap="wrap"
                                gap="xs"
                              >
                                <Text ff="monospace" size="xs">
                                  {permission.key}
                                </Text>
                                <Group gap={4}>
                                  <Badge size="xs" variant="light">
                                    {permission.operation}
                                  </Badge>
                                  <Badge
                                    size="xs"
                                    color={RISK_COLOR[permission.risk_level]}
                                  >
                                    {permission.risk_level}
                                  </Badge>
                                  {permission.is_sensitive && (
                                    <Badge
                                      size="xs"
                                      color="red"
                                      variant="outline"
                                    >
                                      Sensitive
                                    </Badge>
                                  )}
                                </Group>
                              </Group>
                              <Text size="xs" fw={500}>
                                {permission.label}
                              </Text>
                              {permission.description && (
                                <Text size="xs" c="dimmed">
                                  {permission.description}
                                </Text>
                              )}
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Stack>
  );
}

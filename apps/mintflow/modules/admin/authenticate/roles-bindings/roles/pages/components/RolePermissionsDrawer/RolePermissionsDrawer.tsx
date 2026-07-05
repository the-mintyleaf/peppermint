"use client";

import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Divider,
  Drawer,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Switch,
  Text,
  Title,
  Tooltip,
  modals,
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";

import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { PermissionKeyPicker } from "@/modules/admin/authenticate/_shared/PermissionKeyPicker";
import {
  attachRolePermission,
  detachRolePermission,
  fetchRolePermissions,
} from "../../../roles.api";
import { roleQueryKeys } from "../../../roles.queryKeys";
import type { PermissionRiskLevel } from "../../../roles.types";
import type { RolePermissionsDrawerProps } from "./RolePermissionsDrawer.types";

const RISK_COLORS: Record<PermissionRiskLevel, string> = {
  low: "gray",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

export function RolePermissionsDrawer({
  role,
  opened,
  onClose,
}: RolePermissionsDrawerProps) {
  const [permissionKey, setPermissionKey] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const queryClient = useQueryClient();

  const queryKey = role ? roleQueryKeys.permissions(role.id) : [];

  const { data: permissions, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchRolePermissions(role!.id),
    enabled: Boolean(role),
  });

  const attachedPermissions = (permissions ?? []).filter((p) => p.is_active);
  const visiblePermissions = showInactive
    ? (permissions ?? [])
    : attachedPermissions;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  const attachMutation = useMutation({
    mutationFn: (key: string) => attachRolePermission(role!.id, key),
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Permission attached",
        message: `${permissionKey} attached to ${role?.display_name}.`,
      });
      setPermissionKey(null);
      invalidate();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't attach permission",
        message: getApiErrorMessage(error),
      });
    },
  });

  const detachMutation = useMutation({
    mutationFn: (key: string) => detachRolePermission(role!.id, key),
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Permission detached",
        message: "The permission has been detached from this role.",
      });
      invalidate();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't detach permission",
        message: getApiErrorMessage(error),
      });
    },
  });

  const requestDetach = (key: string, riskLevel: PermissionRiskLevel) => {
    const isEscalated = riskLevel === "high" || riskLevel === "critical";
    modals.openConfirmModal({
      title: "Detach permission",
      children: (
        <Stack gap="xs">
          {isEscalated && (
            <Text size="sm" c="red" fw={600}>
              This is a {riskLevel}-risk permission.
            </Text>
          )}
          <Text size="sm">
            Detach <b>{key}</b> from {role?.display_name}? This deactivates the
            grant; it can be re-attached later.
          </Text>
        </Stack>
      ),
      labels: { confirm: "Detach", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => detachMutation.mutate(key),
    });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Title order={5}>Permissions — {role?.display_name ?? ""}</Title>
          <Badge size="sm" variant="light">
            {attachedPermissions.length} attached
          </Badge>
        </Group>
      }
      position="right"
      size="md"
    >
      <Stack gap="md">
        <Group align="flex-end" gap="xs">
          <div style={{ flex: 1 }}>
            <PermissionKeyPicker
              label="Attach permission"
              value={permissionKey}
              onChange={setPermissionKey}
              disabled={attachMutation.isPending}
            />
          </div>
          <Button
            onClick={() =>
              permissionKey && attachMutation.mutate(permissionKey)
            }
            loading={attachMutation.isPending}
            disabled={!permissionKey}
          >
            Attach
          </Button>
        </Group>

        <Group justify="space-between" align="center">
          <Divider label="Currently attached" style={{ flex: 1 }} />
          <Switch
            size="xs"
            label="Show detached/inactive"
            checked={showInactive}
            onChange={(event) => setShowInactive(event.currentTarget.checked)}
          />
        </Group>

        {isLoading ? (
          <Center py="lg">
            <Loader size="sm" />
          </Center>
        ) : visiblePermissions.length === 0 ? (
          <Text size="xs" c="dimmed">
            No permissions attached to this role yet.
          </Text>
        ) : (
          <ScrollArea.Autosize mah={480}>
            <Stack gap="xs">
              {visiblePermissions.map((permission) => (
                <Group
                  key={permission.id}
                  justify="space-between"
                  wrap="nowrap"
                  py={4}
                  style={{ opacity: permission.is_active ? 1 : 0.55 }}
                >
                  <Stack gap={2}>
                    <Text
                      size="xs"
                      fw={600}
                      style={{
                        textDecoration: permission.is_active
                          ? undefined
                          : "line-through",
                      }}
                    >
                      {permission.permission_key}
                    </Text>
                    <Group gap={4}>
                      <Badge size="xs" variant="light">
                        {permission.operation_type_snapshot}
                      </Badge>
                      <Badge
                        size="xs"
                        variant="light"
                        color={RISK_COLORS[permission.risk_level_snapshot]}
                      >
                        {permission.risk_level_snapshot}
                      </Badge>
                      {!permission.is_active && (
                        <Badge size="xs" color="gray" variant="dot">
                          Detached
                        </Badge>
                      )}
                    </Group>
                  </Stack>
                  {permission.is_active && (
                    <Tooltip label="Detach">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label={`Detach ${permission.permission_key}`}
                        onClick={() =>
                          requestDetach(
                            permission.permission_key,
                            permission.risk_level_snapshot,
                          )
                        }
                      >
                        <TrashIcon size={16} aria-hidden />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Drawer>
  );
}

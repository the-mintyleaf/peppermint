"use client";

import {
  Badge,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  useQuery,
} from "@peppermint/ui";
import { formatRelative } from "@peppermint/utils";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { getApiError } from "@/lib/authErrorMessages";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { ScopeType } from "@/modules/admin/authenticate/_shared/authenticate.types";
import { fetchRoleBindingsForSubject } from "@/modules/admin/authenticate/bindings/bindings.api";
import { fetchGrantsForSubject } from "@/modules/admin/authenticate/grants/grants.api";
import { fetchRoleDirectory } from "@/modules/admin/authenticate/roles/roles.api";
import type { Role } from "@/modules/admin/authenticate/roles/roles.types";

const SCOPE_LABELS: Record<ScopeType, string> = {
  global: "Global",
  organization: "Organization",
  organization_unit: "Organization unit",
};

function isPermissionDenied(error: unknown): boolean {
  return getApiError(error).code === "PERMISSION_DENIED";
}

function ValidityText({
  validFrom,
  validUntil,
}: {
  validFrom: string | null;
  validUntil: string | null;
}) {
  if (!validFrom && !validUntil) {
    return (
      <Text size="xs" c="dimmed">
        No expiry
      </Text>
    );
  }
  return (
    <Text size="xs" c="dimmed">
      {validFrom ? `From ${formatRelative(validFrom)}` : null}
      {validFrom && validUntil ? " · " : null}
      {validUntil ? `Until ${formatRelative(validUntil)}` : null}
    </Text>
  );
}

function SectionState({
  isLoading,
  error,
  isEmpty,
  emptyMessage,
  deniedMessage,
  errorMessage,
  onRetry,
  isRetrying,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  isEmpty: boolean;
  emptyMessage: string;
  deniedMessage: string;
  errorMessage: string;
  onRetry: () => void;
  isRetrying: boolean;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <Group justify="center" py="lg">
        <Loader size="sm" />
      </Group>
    );
  }
  if (error) {
    if (isPermissionDenied(error)) {
      return (
        <Text size="xs" c="dimmed">
          {deniedMessage}
        </Text>
      );
    }
    return (
      <QueryErrorState
        message={errorMessage}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }
  if (isEmpty) {
    return (
      <Text size="xs" c="dimmed">
        {emptyMessage}
      </Text>
    );
  }
  return <>{children}</>;
}

export function PermissionsTab() {
  const { user } = useCurrentUser();

  const bindingsQuery = useQuery({
    queryKey: ["permissions", "role-bindings", "subject", user?.id],
    queryFn: () => fetchRoleBindingsForSubject(user!.id),
    enabled: Boolean(user),
  });

  const grantsQuery = useQuery({
    queryKey: ["permissions", "grants", "subject", user?.id],
    queryFn: () => fetchGrantsForSubject(user!.id),
    enabled: Boolean(user),
  });

  const activeBindings = (bindingsQuery.data ?? []).filter(
    (binding) => binding.status === "active",
  );
  const activeGrants = (grantsQuery.data ?? []).filter(
    (grant) => grant.status === "active",
  );

  // Role bindings carry role ids only — resolve display names from the role
  // directory, falling back to the raw id when that lookup isn't permitted.
  const rolesQuery = useQuery({
    queryKey: ["permissions", "roles", "directory"],
    queryFn: fetchRoleDirectory,
    enabled: activeBindings.length > 0,
    retry: false,
  });

  const roleNameById = new Map<string, string>(
    (rolesQuery.data ?? []).map((role: Role) => [role.id, role.display_name]),
  );

  return (
    <Stack gap="lg">
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group gap="xs">
            <KeyIcon size={16} aria-hidden />
            <Title order={4} size="xs">
              Roles
            </Title>
          </Group>
          <SectionState
            isLoading={!user || bindingsQuery.isLoading}
            error={bindingsQuery.error}
            isEmpty={activeBindings.length === 0}
            emptyMessage="No roles are assigned to you."
            deniedMessage="Your account isn't allowed to view its own role assignments. Ask an administrator if you need this list."
            errorMessage="Couldn't load your roles."
            onRetry={() => bindingsQuery.refetch()}
            isRetrying={bindingsQuery.isRefetching}
          >
            <Stack gap="sm">
              {activeBindings.map((binding) => (
                <Group
                  key={binding.id}
                  justify="space-between"
                  wrap="nowrap"
                  align="flex-start"
                >
                  <Stack gap={2}>
                    <Text size="xs" fw={500}>
                      {roleNameById.get(binding.role) ?? binding.role}
                    </Text>
                    <ValidityText
                      validFrom={binding.valid_from}
                      validUntil={binding.valid_until}
                    />
                  </Stack>
                  <Badge variant="light" color="gray" size="sm">
                    {SCOPE_LABELS[binding.scope_type]}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </SectionState>
        </Stack>
      </Card>

      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group gap="xs">
            <CheckCircleIcon size={16} aria-hidden />
            <Title order={4} size="xs">
              Direct grants
            </Title>
          </Group>
          <SectionState
            isLoading={!user || grantsQuery.isLoading}
            error={grantsQuery.error}
            isEmpty={activeGrants.length === 0}
            emptyMessage="No permissions are granted to you directly."
            deniedMessage="Your account isn't allowed to view its own direct grants. Ask an administrator if you need this list."
            errorMessage="Couldn't load your direct grants."
            onRetry={() => grantsQuery.refetch()}
            isRetrying={grantsQuery.isRefetching}
          >
            <Stack gap="sm">
              {activeGrants.map((grant) => (
                <Group
                  key={grant.id}
                  justify="space-between"
                  wrap="nowrap"
                  align="flex-start"
                >
                  <Stack gap={2}>
                    <Text size="xs" fw={500} ff="monospace">
                      {grant.permission_key}
                    </Text>
                    {grant.reason ? (
                      <Text size="xs" c="dimmed">
                        {grant.reason}
                      </Text>
                    ) : null}
                    <ValidityText
                      validFrom={grant.valid_from}
                      validUntil={grant.valid_until}
                    />
                  </Stack>
                  <Badge variant="light" color="gray" size="sm">
                    {SCOPE_LABELS[grant.scope_type]}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </SectionState>
        </Stack>
      </Card>
    </Stack>
  );
}

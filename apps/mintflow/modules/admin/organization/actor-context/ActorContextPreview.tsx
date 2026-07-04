"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Group,
  List,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
  TextInput,
  Title,
  useQuery,
} from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";
import { UserPicker } from "@/modules/admin/authenticate/_shared/UserPicker";

import { fetchActorContext } from "./actorContext.api";

function ActorContextPreviewContent() {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [atTime, setAtTime] = useState("");
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);

  const { data: context, isFetching } = useQuery({
    queryKey: ["actor-context", resolvedUserId, orgId, atTime],
    queryFn: () =>
      fetchActorContext({
        userId: resolvedUserId as string,
        organizationId: orgId,
        atTime: atTime || undefined,
      }),
    enabled: Boolean(resolvedUserId),
  });

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Organization", href: "/admin/organization" },
          { label: "Actor Context", href: "#" },
        ]}
      />
      <ModalPaper withBorder>
        <Stack gap="md" p="md">
          <Card withBorder padding="md" radius="md">
            <Stack gap="sm">
              <UserPicker label="User" value={userId} onChange={setUserId} />
              <TextInput
                label="At Time"
                description="Optional — leave blank to resolve as of now"
                type="datetime-local"
                value={atTime}
                onChange={(e) => setAtTime(e.currentTarget.value)}
              />
              <Button
                disabled={!userId}
                loading={isFetching}
                onClick={() => setResolvedUserId(userId)}
              >
                Resolve Context
              </Button>
            </Stack>
          </Card>

          {resolvedUserId && !isFetching && context && (
            <>
              <Card withBorder padding="md" radius="md">
                <Title order={5} mb="xs">
                  Membership
                </Title>
                {context.membership ? (
                  <Group gap="xs">
                    <Badge size="xs">{context.membership.status}</Badge>
                    {context.membership.is_primary && (
                      <Badge size="xs" color="blue">
                        Primary
                      </Badge>
                    )}
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    This user has no active membership in{" "}
                    {context.organization?.name ?? "this organization"}.
                  </Text>
                )}
              </Card>

              <Card withBorder padding="md" radius="md">
                <Title order={5} mb="xs">
                  Unit Memberships
                </Title>
                {context.unit_memberships.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No unit memberships.
                  </Text>
                ) : (
                  <List size="sm">
                    {context.unit_memberships.map((um) => (
                      <List.Item key={um.id}>
                        {um.unit.path_cache || um.unit.code}
                        {um.is_primary ? " (primary)" : ""} · {um.status}
                      </List.Item>
                    ))}
                  </List>
                )}
              </Card>

              <Card withBorder padding="md" radius="md">
                <Title order={5} mb="xs">
                  Position Assignments
                </Title>
                {context.position_assignments.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No position assignments.
                  </Text>
                ) : (
                  <List size="sm">
                    {context.position_assignments.map((pa) => (
                      <List.Item key={pa.id}>
                        {pa.position.title} ({pa.position.code}) ·{" "}
                        {pa.assignment_type}
                        {pa.is_primary ? " (primary)" : ""} · {pa.status}
                      </List.Item>
                    ))}
                  </List>
                )}
              </Card>

              <Card withBorder padding="md" radius="md">
                <Title order={5} mb="xs">
                  Reporting Chain
                </Title>
                {context.reporting_chain.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No reporting chain resolved.
                  </Text>
                ) : (
                  <List size="sm">
                    {context.reporting_chain.map((link, index) => (
                      <List.Item key={index}>
                        {link.position.code} reports to {link.reports_to.code} (
                        {link.reporting_line_type})
                      </List.Item>
                    ))}
                  </List>
                )}
              </Card>

              <Card withBorder padding="md" radius="md">
                <Title order={5} mb="xs">
                  Active Delegations Received
                </Title>
                {context.active_delegations_received.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No active delegations received.
                  </Text>
                ) : (
                  <List size="sm">
                    {context.active_delegations_received.map((delegation) => (
                      <List.Item key={delegation.id}>
                        {delegation.delegation_type} · since{" "}
                        {new Date(delegation.starts_at).toLocaleDateString()}
                      </List.Item>
                    ))}
                  </List>
                )}
              </Card>
            </>
          )}
        </Stack>
      </ModalPaper>
    </>
  );
}

export function ActorContextPreview() {
  return (
    <RequireStaff>
      <ActorContextPreviewContent />
    </RequireStaff>
  );
}

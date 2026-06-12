"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Badge,
  Button,
  ActionIcon,
  Table,
  TextInput,
  Select,
  Modal,
  Skeleton,
  Avatar,
  Center,
} from "@zetsel/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useTeamMembers, useInviteMember, useUpdateMemberRole, useRemoveMember } from "../settings.hooks";
import type { TeamMember } from "../settings.api";

const ROLE_COLOR: Record<TeamMember["role"], string> = {
  owner: "red",
  admin: "orange",
  editor: "blue",
  viewer: "gray",
};

const STATUS_COLOR: Record<TeamMember["status"], string> = {
  active: "green",
  invited: "yellow",
  suspended: "red",
};

export function TeamList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("editor");

  const { data: members = [], isLoading } = useTeamMembers();
  const invite = useInviteMember();
  const updateRole = useUpdateMemberRole();
  const remove = useRemoveMember();

  async function handleInvite() {
    if (!email.trim()) return;
    await invite.mutateAsync({ email: email.trim(), role });
    notifications.show({ message: `Invite sent to ${email}`, color: "green" });
    setEmail("");
    setModalOpen(false);
  }

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Team & Roles</Title>
            <Text c="dimmed" size="sm">Manage who has access to your workspace</Text>
          </Stack>
          <Button size="sm" leftSection={<PlusIcon size={14} />} onClick={() => setModalOpen(true)}>
            Invite Member
          </Button>
        </Group>
      </Paper>

      {isLoading ? (
        <Stack gap="xs">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={56} radius="md" />)}</Stack>
      ) : (
        <Paper withBorder radius="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Member</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Joined</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {members.map((m) => (
                <Table.Tr key={m.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" src={m.avatarUrl} radius="xl">
                        {m.name.charAt(0)}
                      </Avatar>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{m.name}</Text>
                        <Text size="xs" c="dimmed">{m.email}</Text>
                      </Stack>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {m.role === "owner" ? (
                      <Badge size="xs" color="red" variant="light">owner</Badge>
                    ) : (
                      <Select
                        size="xs"
                        w={100}
                        value={m.role}
                        data={["admin", "editor", "viewer"].map((r) => ({ label: r, value: r }))}
                        onChange={(v) => updateRole.mutate({ id: m.id, role: v as TeamMember["role"] })}
                      />
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" color={STATUS_COLOR[m.status]} variant="light">{m.status}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">{m.joinedAt.toLocaleDateString()}</Text>
                  </Table.Td>
                  <Table.Td>
                    {m.role !== "owner" && (
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => remove.mutate(m.id)}
                        aria-label="Remove member"
                      >
                        <TrashIcon size={12} />
                      </ActionIcon>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Invite Team Member" size="sm">
        <Stack gap="md">
          <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} placeholder="colleague@company.com" />
          <Select
            label="Role"
            data={[
              { label: "Admin — full access", value: "admin" },
              { label: "Editor — create & publish", value: "editor" },
              { label: "Viewer — read only", value: "viewer" },
            ]}
            value={role}
            onChange={(v) => setRole((v as TeamMember["role"]) ?? "editor")}
          />
          <Button fullWidth loading={invite.isPending} disabled={!email.trim()} onClick={handleInvite}>
            Send Invite
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}

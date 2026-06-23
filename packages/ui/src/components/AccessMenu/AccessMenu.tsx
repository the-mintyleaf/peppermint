'use client';

import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  Popover,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { AccessLevelMenu } from './AccessLevelMenu';
import { notifications } from '@mantine/notifications';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { LinkIcon } from '@phosphor-icons/react/dist/csr/Link';
import { ShieldIcon } from '@phosphor-icons/react/dist/csr/Shield';
import { UsersIcon } from '@phosphor-icons/react/dist/csr/Users';
import type { AccessLevel, AccessMenuProps } from './AccessMenu.types';

export function AccessMenu({
  data,
  onChange,
  shareUrl,
  label = 'Access',
  width = 400,
}: AccessMenuProps) {
  const [opened, setOpened] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteLevel, setInviteLevel] = useState<AccessLevel>('view');

  const resolvedShareUrl =
    shareUrl ?? (typeof window !== 'undefined' ? window.location.href : '');

  const handleInvite = () => {
    const query = inviteQuery.trim();
    if (!query) return;
    onChange?.({
      type: 'invite',
      inviteQuery: query,
      accessLevel: inviteLevel,
    });
    setInviteQuery('');
    setOpened(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(resolvedShareUrl);
      notifications.show({ message: 'Link copied to clipboard', color: 'green' });
    } catch {
      notifications.show({ message: 'Failed to copy link', color: 'red' });
    }
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      shadow="md"
      width={width}
      withArrow
    >
      <Popover.Target>
        <Button
          variant="light"
          size="xs"
          leftSection={<UsersIcon size={14} />}
          rightSection={<CaretDownIcon size={12} />}
          onClick={() => setOpened((v) => !v)}
        >
          {label}
        </Button>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Stack gap="sm" p="md">
          <Group gap="xs" wrap="nowrap" align="flex-end">
            <TextInput
              flex={1}
              size="xs"
              placeholder="Email, name…"
              value={inviteQuery}
              onChange={(e) => setInviteQuery(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInvite();
              }}
            />
            <AccessLevelMenu
              value={inviteLevel}
              onChange={setInviteLevel}
            />
            <Button size="xs" color="brand" onClick={handleInvite}>
              Invite
            </Button>
          </Group>

          <Box>
            <Text size="xs" c="dimmed" mb="xs">
              General access
            </Text>
            <Stack gap="xs">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size="md" variant="light" color="brand" radius="md">
                  <UsersIcon size={16} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" fw={600}>
                    Only those invited
                  </Text>
                  <Text size="xs" c="dimmed">
                    {data.invitedCount ?? data.accounts.length} people
                  </Text>
                </Box>
              </Group>
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size="md" variant="light" color="indigo" radius="md">
                  <ShieldIcon size={16} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" fw={600}>
                    Role-based access
                  </Text>
                  <Text size="xs" c="dimmed">
                    {data.roles.length} roles
                  </Text>
                </Box>
              </Group>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Text size="xs" c="dimmed" mb="xs">
              Roles with access
            </Text>
            <Stack gap="xs" mah={140} style={{ overflowY: 'auto' }}>
              {data.roles.map((role) => (
                <Group key={role.id} gap="sm" wrap="nowrap" justify="space-between">
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <ThemeIcon size="sm" variant="light" color="gray" radius="md">
                      <ShieldIcon size={14} />
                    </ThemeIcon>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="xs" fw={600} truncate>
                        {role.name}
                      </Text>
                      {role.description && (
                        <Text size="xs" c="dimmed" truncate>
                          {role.description}
                        </Text>
                      )}
                    </Box>
                  </Group>
                  <AccessLevelMenu
                    value={role.accessLevel}
                    onChange={(accessLevel) =>
                      onChange?.({
                        type: 'role',
                        roleId: role.id,
                        accessLevel,
                      })
                    }
                  />
                </Group>
              ))}
              {data.roles.length === 0 && (
                <Text size="xs" c="dimmed" ta="center" py="xs">
                  No roles with access
                </Text>
              )}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Text size="xs" c="dimmed" mb="xs">
              Accounts with access
            </Text>
            <Stack gap="xs" mah={160} style={{ overflowY: 'auto' }}>
              {data.accounts.map((account) => (
                <Group key={account.id} gap="sm" wrap="nowrap" justify="space-between">
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Avatar
                      src={account.avatarUrl}
                      size="sm"
                      radius="xl"
                      name={account.name}
                    />
                    <Box style={{ minWidth: 0 }}>
                      <Text size="xs" fw={600} truncate>
                        {account.name}
                      </Text>
                      {account.email && (
                        <Text size="xs" c="dimmed" truncate>
                          {account.email}
                        </Text>
                      )}
                    </Box>
                  </Group>
                  <AccessLevelMenu
                    value={account.accessLevel}
                    onChange={(accessLevel) =>
                      onChange?.({
                        type: 'account',
                        accountId: account.id,
                        accessLevel,
                      })
                    }
                  />
                </Group>
              ))}
              {data.accounts.length === 0 && (
                <Text size="xs" c="dimmed" ta="center" py="xs">
                  No accounts with access
                </Text>
              )}
            </Stack>
          </Box>
        </Stack>

        <Group
          gap="sm"
          px="md"
          py="sm"
          wrap="nowrap"
          justify="space-between"
          style={{
            borderTop: '1px solid var(--mantine-color-gray-3)',
            backgroundColor: 'var(--mantine-color-gray-0)',
          }}
        >
          <Text size="xs" c="dimmed" truncate style={{ flex: 1 }}>
            {resolvedShareUrl}
          </Text>
          <Button
            size="xs"
            color="brand"
            leftSection={<LinkIcon size={14} />}
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}

"use client";

import {
  Avatar,
  Group,
  Indicator,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@peppermint/ui";
import { BellSlashIcon } from "@phosphor-icons/react/dist/csr/BellSlash";
import { CircleIcon } from "@phosphor-icons/react/dist/csr/Circle";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { GearIcon } from "@phosphor-icons/react/dist/csr/Gear";
import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon";
import { PlanetIcon } from "@phosphor-icons/react/dist/csr/Planet";
import { QuestionIcon } from "@phosphor-icons/react/dist/csr/Question";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";
import { SunIcon } from "@phosphor-icons/react/dist/csr/Sun";
import type { UserInfoPopoverProps } from "./UserInfoPopover.types";

export function UserInfoPopover({
  variant = "default",
  user = null,
  onLogout,
  disableSetAway = false,
  disablePauseNotifications = false,
  disableHelp = false,
  disableSettings = false,
  disableTheme = false,
}: UserInfoPopoverProps) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark");
  const isDark = computedColorScheme === "dark";

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.username
    : "User";
  const userEmail = user?.email ?? "";

  const handleLogout = () => {
    onLogout?.();
  };

  const menuPosition = variant === "icon" ? "right-end" : "right-end";

  return (
    <Menu shadow="md" position={menuPosition} withArrow offset={8}>
      <Menu.Target>
        {variant === "icon" ? (
          <Tooltip label={displayName} position="right" withArrow>
            <UnstyledButton
              aria-label="User menu"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "var(--mantine-radius-md)",
              }}
            >
              <Indicator position="bottom-end" withBorder size={8} offset={2}>
                <Avatar
                  radius="md"
                  variant="filled"
                  name={displayName}
                  color="orange"
                  size={32}
                />
              </Indicator>
            </UnstyledButton>
          </Tooltip>
        ) : (
          <UnstyledButton
            bg={isDark ? "dark.7" : "gray.1"}
            style={{
              padding: "12px 8px",
              borderRadius: "var(--mantine-radius-sm)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
            }}
          >
            <Indicator position="bottom-end" withBorder size={8} offset={2}>
              <Avatar
                radius="md"
                variant="filled"
                name={displayName}
                color="orange"
                size="sm"
              />
            </Indicator>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text fw={600} size="xs" truncate c={isDark ? "gray.0" : "dark.8"}>
                {displayName}
              </Text>
              <Text size="10px" c="dimmed" truncate>
                {user?.roles?.[0] === "admin"
                  ? "Administrator"
                  : "Data Entry Staff"}
              </Text>
            </div>
            <DotsThreeVerticalIcon
              size={16}
              weight="bold"
              color={isDark ? "var(--mantine-color-gray-0)" : "var(--mantine-color-dark-5)"}
              style={{ flexShrink: 0 }}
            />
          </UnstyledButton>
        )}
      </Menu.Target>

      <Menu.Dropdown miw={220}>
        <Menu.Item closeMenuOnClick={false} style={{ cursor: "default" }}>
          <Group gap="sm" wrap="nowrap">
            <Avatar
              radius="sm"
              variant="filled"
              name={displayName}
              color="orange"
              size="sm"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text fw={600} size="sm" truncate>
                {displayName}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {userEmail}
              </Text>
              {user?.roles && user.roles.length > 0 && (
                <Text size="xs" c="blue" fw={500} truncate>
                  {user.roles[0] === "admin"
                    ? "👤 Administrator"
                    : "👥 Data Entry Staff"}
                </Text>
              )}
            </div>
          </Group>
        </Menu.Item>

        <Menu.Divider />

        {!disableSetAway && (
          <Menu.Item
            leftSection={
              <CircleIcon
                size={16}
                weight="fill"
                style={{ color: "var(--mantine-color-yellow-6)" }}
              />
            }
          >
            <Text size="xs">Set yourself as away</Text>
          </Menu.Item>
        )}

        {!disablePauseNotifications && (
          <Menu.Item leftSection={<BellSlashIcon size={16} />}>
            <Text size="xs">Pause Notifications</Text>
          </Menu.Item>
        )}

        {(!disableSetAway || !disablePauseNotifications) && <Menu.Divider />}

        {!disableHelp && (
          <Menu.Item leftSection={<QuestionIcon size={16} />}>
            <Text size="xs">Help</Text>
          </Menu.Item>
        )}

        {!disableSettings && (
          <Menu.Item leftSection={<GearIcon size={16} />}>
            <Text size="xs">Settings</Text>
          </Menu.Item>
        )}

        <Menu.Divider />

        {!disableTheme && (
          <>
            <Menu.Label>
              <Text size="xs">Theme</Text>
            </Menu.Label>

            <Menu.Item
              onClick={() => setColorScheme("light")}
              rightSection={colorScheme === "light" ? "✓" : undefined}
            >
              <Group gap="xs" justify="space-between">
                <Text size="xs">Light</Text>
                <SunIcon size={14} />
              </Group>
            </Menu.Item>

            <Menu.Item
              onClick={() => setColorScheme("dark")}
              rightSection={colorScheme === "dark" ? "✓" : undefined}
            >
              <Group gap="xs" justify="space-between">
                <Text size="xs">Dark</Text>
                <MoonIcon size={14} />
              </Group>
            </Menu.Item>

            <Menu.Item
              onClick={() => setColorScheme("auto")}
              rightSection={colorScheme === "auto" ? "✓" : undefined}
            >
              <Group gap="xs" justify="space-between">
                <Text size="xs">System</Text>
                <PlanetIcon size={14} />
              </Group>
            </Menu.Item>
          </>
        )}

        <Menu.Divider />

        <Menu.Item
          leftSection={<SignOutIcon size={16} />}
          onClick={handleLogout}
        >
          <Text size="xs">Sign out</Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

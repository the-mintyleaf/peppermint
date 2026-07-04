"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Menu,
  Text,
  Tooltip,
  modals,
  notifications,
} from "@peppermint/ui";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { LockKeyOpenIcon } from "@phosphor-icons/react/dist/csr/LockKeyOpen";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import {
  disableUserLogin,
  enableUserLogin,
  forcePasswordChange,
  unlockUser,
} from "../../../../users.api";
import { usersQueryKeys } from "../../../../users.queryKeys";
import { LockAccountModalContent } from "../LockAccountModalContent";
import { SetTemporaryPasswordModalContent } from "../SetTemporaryPasswordModalContent";
import type { UserRowActionsMenuProps } from "./UserRowActionsMenu.types";

export function UserRowActionsMenu({
  user,
  isSelf,
  onViewDetails,
}: UserRowActionsMenuProps) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: usersQueryKeys.listKey() });

  const enableLoginMutation = useMutation({
    mutationFn: () => enableUserLogin(user.id),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Login enabled." });
      invalidate();
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error) }),
  });

  const disableLoginMutation = useMutation({
    mutationFn: () => disableUserLogin(user.id),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Login disabled." });
      invalidate();
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error) }),
  });

  const unlockMutation = useMutation({
    mutationFn: () => unlockUser(user.id),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Account unlocked." });
      invalidate();
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error) }),
  });

  const forcePasswordChangeMutation = useMutation({
    mutationFn: () => forcePasswordChange(user.id),
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: "Password change will be required at next login.",
      });
      invalidate();
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error) }),
  });

  const handleDisableLogin = () => {
    modals.openConfirmModal({
      title: "Disable login",
      children: (
        <Text size="sm">
          This will prevent {user.display_name} from signing in. Continue?
        </Text>
      ),
      labels: { confirm: "Disable login", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => disableLoginMutation.mutate(),
    });
  };

  const handleLock = () => {
    modals.open({
      title: "Lock account",
      children: <LockAccountModalContent userId={user.id} />,
    });
  };

  const handleForcePasswordChange = () => {
    modals.openConfirmModal({
      title: "Force password change",
      children: (
        <Text size="sm">
          {user.display_name} will be required to change their password at next
          login. Continue?
        </Text>
      ),
      labels: { confirm: "Force change", cancel: "Cancel" },
      confirmProps: { color: "orange" },
      onConfirm: () => forcePasswordChangeMutation.mutate(),
    });
  };

  const handleSetTemporaryPassword = () => {
    modals.open({
      title: "Set temporary password",
      children: <SetTemporaryPasswordModalContent userId={user.id} />,
    });
  };

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" aria-label="Row actions">
          <DotsThreeVerticalIcon size={16} aria-hidden />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<EyeIcon size={14} aria-hidden />}
          onClick={() => onViewDetails(user)}
        >
          View details
        </Menu.Item>
        <Menu.Divider />

        {user.is_login_enabled ? (
          <Tooltip label="You can't disable your own login" disabled={!isSelf}>
            <Menu.Item
              leftSection={<ProhibitIcon size={14} aria-hidden />}
              color="red"
              disabled={isSelf}
              onClick={handleDisableLogin}
            >
              Disable login
            </Menu.Item>
          </Tooltip>
        ) : (
          <Menu.Item
            leftSection={<CheckCircleIcon size={14} aria-hidden />}
            onClick={() => enableLoginMutation.mutate()}
          >
            Enable login
          </Menu.Item>
        )}

        <Tooltip label="You can't lock your own account" disabled={!isSelf}>
          <Menu.Item
            leftSection={<LockKeyIcon size={14} aria-hidden />}
            color="red"
            disabled={isSelf}
            onClick={handleLock}
          >
            Lock account
          </Menu.Item>
        </Tooltip>
        <Menu.Item
          leftSection={<LockKeyOpenIcon size={14} aria-hidden />}
          onClick={() => unlockMutation.mutate()}
        >
          Unlock account
        </Menu.Item>

        <Menu.Divider />
        <Menu.Item
          leftSection={<ArrowsClockwiseIcon size={14} aria-hidden />}
          onClick={handleForcePasswordChange}
        >
          Force password change
        </Menu.Item>
        <Menu.Item
          leftSection={<KeyIcon size={14} aria-hidden />}
          onClick={handleSetTemporaryPassword}
        >
          Set temporary password
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

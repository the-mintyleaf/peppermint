"use client";

import {
  Button,
  Menu,
  notifications,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import type { Role } from "@/modules/admin/authenticate/_shared/authenticate.types";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { changeUserRole } from "../../../../users.api";
import { usersQueryKeys } from "../../../../users.queryKeys";
import type { UserRoleCellProps } from "./UserRoleCell.types";

const ROLE_COLORS: Partial<Record<Role, string>> = {
  superadmin: "grape",
  admin: "blue",
  staff: "gray",
};

const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  staff: "Staff",
};

// Roles a superadmin may assign from the table (never superadmin).
const ASSIGNABLE: Role[] = ["staff", "admin"];

/**
 * The role cell. For a superadmin acting on a non-superadmin that isn't their own
 * row, renders a dropdown to switch between Staff and Admin (`PATCH /users/<id>/`).
 * Otherwise a plain, non-interactive badge — role is a fact, not an action, there.
 */
export function UserRoleCell({
  user,
  currentUserId,
  isSuperadmin,
}: UserRoleCellProps) {
  const queryClient = useQueryClient();
  const role = user.role;

  const mutation = useMutation({
    mutationFn: (next: Role) => changeUserRole(user.id, next),
    onSuccess: (_data, next) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      notifications.show({
        color: "green",
        title: "Role updated",
        message: `@${user.username} is now ${ROLE_LABELS[next]}.`,
      });
    },
    onError: (error) =>
      notifications.show({
        color: "red",
        title: "Couldn't change role",
        message: getApiErrorMessage(error),
      }),
  });

  const roleColor = ROLE_COLORS[role] ?? "gray";
  const badge = (
    <StatusBadge<Role>
      value={role}
      colorMap={ROLE_COLORS}
      labelMap={ROLE_LABELS}
    />
  );

  const isSelf = user.id === currentUserId;
  const canChange = isSuperadmin && role !== "superadmin" && !isSelf;
  if (!canChange) return badge;

  const targets = ASSIGNABLE.filter((r) => r !== role);

  return (
    <Menu position="bottom-start" width="target" withinPortal>
      <Menu.Target>
        <Button
          variant="subtle"
          color={roleColor}
          size="xs"
          fullWidth
          justify="space-between"
          loading={mutation.isPending}
          // Paler tint of the role color, matching the status cell.
          styles={{
            root: {
              backgroundColor: `var(--mantine-color-${roleColor}-0)`,
              color: `var(--mantine-color-${roleColor}-9)`,
            },
          }}
          rightSection={<CaretDownIcon size={12} aria-hidden />}
          aria-label={`Change role for ${user.username}`}
        >
          {ROLE_LABELS[role]}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Change role</Menu.Label>
        {targets.map((r) => (
          <Menu.Item key={r} onClick={() => mutation.mutate(r)}>
            Make {ROLE_LABELS[r]}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

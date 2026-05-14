"use client";

import { useId } from "react";
import { usePathname } from "next/navigation";
import {
  Badge,
  Button,
  ButtonGroup,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import {
  ArrowClockwiseIcon,
  CaretDownIcon,
  PlusIcon,
} from "@phosphor-icons/react";

import { DataTableWrapper } from "@settle/core";
import { PropDataTableHeader } from "../../DataTableShell.type";
import { useModalForm } from "../../context/ModalFormContext";

export function DataTableShellHeader({
  moduleInfo,
  newButtonHref,
  sustained = false,
  onNewClick,
  disableCreateButton = false,
  customHeading,
}: PropDataTableHeader) {
  // * CONTEXT
  const moreActionsMenuId = useId();
  const newButtonMenuId = useId();
  const pathname = usePathname();
  const { refetch } = DataTableWrapper.useDataTableContext();
  const finalHref = newButtonHref || `${pathname}/new`;

  let modalContext: ReturnType<typeof useModalForm> | undefined;
  try {
    modalContext = useModalForm();
  } catch (e) {
    // Modal context not available
    modalContext = undefined;
  }

  // let dataTableModalContext: ReturnType<typeof useDataTableModalShellContext> | undefined;
  // try {
  //   dataTableModalContext = useDataTableModalShellContext();
  // } catch (e) {
  //   // DataTableModalShell context not available
  //   dataTableModalContext = undefined;
  // }

  const handleNewClick = sustained
    ? onNewClick ||
    // dataTableModalContext?.openCreateModal ||
    modalContext?.openModal
    : undefined;

  return (
    <Stack gap="sm">
      <Group justify="space-between" h={80}>
        <div>
          <Group gap={8}>
            <div>
              <Text size="xl" fw={900}>
                {customHeading || moduleInfo.label}
              </Text>
            </div>

          </Group>
          <Text size="xs" opacity={0.5}>
            {moduleInfo.description}
          </Text>
        </div>

        {/* Desktop: Full buttons */}
        <Group gap={4} visibleFrom="lg">

          {/* <Menu id={moreActionsMenuId}>
            <Menu.Target>
              <Button
                rightSection={<CaretDownIcon />}
                size="xs"
                variant="subtle"
                color="dark"
              >
                More Actions
              </Button>
            </Menu.Target>
            <Menu.Dropdown></Menu.Dropdown>
          </Menu> */}

          <Button
            leftSection={<ArrowClockwiseIcon />}
            size="xs"
            variant="light"
            color="dark"
            onClick={() => {
              refetch();
            }}
          >
            Reload Data
          </Button>

          <ButtonGroup>
            {sustained && handleNewClick ? (
              <Button
                onClick={handleNewClick}
                size="xs"
                leftSection={<PlusIcon />}
                disabled={disableCreateButton}
              >
                New {moduleInfo.label}
              </Button>
            ) : (
              <Button
                component="a"
                href={disableCreateButton ? undefined : finalHref}
                size="xs"
                leftSection={<PlusIcon />}
                disabled={disableCreateButton}
              >
                New {moduleInfo.label}
              </Button>
            )}

            {/* <Menu id={newButtonMenuId}>
              <Menu.Target>
                <Button size="xs" px={8} ml={1} disabled={disableCreateButton}>
                  <CaretDownIcon />
                </Button>
              </Menu.Target>
              <Menu.Dropdown></Menu.Dropdown>
            </Menu> */}
          </ButtonGroup>
        </Group>
      </Group>
    </Stack>
  );
}

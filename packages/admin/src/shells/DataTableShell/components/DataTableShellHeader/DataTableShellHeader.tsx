"use client";

import { Button, ButtonGroup, Group, Stack, Text } from "@zetsel/ui";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useTableData } from "../../../../wrappers/DataTableWrapper";
import type { DataTableShellHeaderProps } from "../../DataTableShell.types";

export function DataTableShellHeader({
  moduleInfo,
  basePath,
  newButtonHref,
  onNewClick,
  disableCreateButton = false,
  sustained = false,
}: DataTableShellHeaderProps) {
  const { refetch } = useTableData();
  const displayLabel = moduleInfo.label ?? moduleInfo.name;
  const finalHref = newButtonHref ?? (basePath ? `${basePath}/new` : undefined);

  return (
    <Stack gap={2} visibleFrom="lg">
      <Group justify="space-between" h={80} align="center">
        <div>
          <Text size="2rem" fw={400}>
            Manage {displayLabel}
          </Text>
        </div>

        <Group gap={4}>
          {/* <Button
            leftSection={<ArrowsClockwiseIcon size={14} />}
            size="xs"
            variant="light"
            color="dark"
            onClick={() => refetch()}
          >
            Reload Data
          </Button> */}

          <ButtonGroup>
            {sustained && onNewClick ? (
              <Button
                size="xs"
                leftSection={<PlusIcon size={14} />}
                disabled={disableCreateButton}
                onClick={onNewClick}
              >
                New {displayLabel}
              </Button>
            ) : (
              <Button
                component="a"
                href={disableCreateButton ? undefined : finalHref}
                size="xs"
                leftSection={<PlusIcon size={14} />}
                disabled={disableCreateButton}
                suppressHydrationWarning
              >
                New {displayLabel}
              </Button>
            )}
          </ButtonGroup>
        </Group>
      </Group>
    </Stack>
  );
}

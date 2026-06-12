"use client";

import { Button, ButtonGroup, Group, Stack, Text } from "@zetsel/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import type { ReactNode } from "react";

export interface ModulePageInfo {
  name: string;
  label?: string;
  description?: string;
}

export interface ModulePageHeaderProps {
  moduleInfo: ModulePageInfo;
  basePath?: string;
  newButtonHref?: string;
  onNewClick?: () => void;
  disableCreateButton?: boolean;
  sustained?: boolean;
  actions?: ReactNode;
}

export function ModulePageHeader({
  moduleInfo,
  basePath,
  newButtonHref,
  onNewClick,
  disableCreateButton = false,
  sustained = false,
  actions,
}: ModulePageHeaderProps) {
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
          {actions}
          {!disableCreateButton && (
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
          )}
        </Group>
      </Group>
    </Stack>
  );
}

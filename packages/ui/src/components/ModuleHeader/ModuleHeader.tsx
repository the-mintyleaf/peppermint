"use client";

import { Box, Divider, Group } from "@mantine/core";
import { PageBreadcrumb } from "../PageBreadcrumb";
import { SubNavExpandButton } from "../SubNavExpandButton";
import type { ModuleHeaderProps } from "./ModuleHeader.types";

// Rendered height when `center` is not used — shared with ModalPaper's default height calc.
export const MODULE_HEADER_HEIGHT = 55;
const MODULE_HEADER_HEIGHT_WITH_CENTER = 55;

export function ModuleHeader({
  breadcrumbItems = [],
  breadcrumbColor,
  center,
  right,
  withDivider = false,
}: ModuleHeaderProps) {
  const breadcrumb = (
    <PageBreadcrumb items={breadcrumbItems} color={breadcrumbColor} />
  );

  const leftContent = (
    <Group gap={0} align="center" wrap="nowrap">
      <SubNavExpandButton />
      {breadcrumb}
    </Group>
  );

  return (
    <>
      {center ? (
        <Box pos="relative" h={MODULE_HEADER_HEIGHT_WITH_CENTER}>
          <Group pl="md" h="100%" justify="space-between" wrap="nowrap">
            {leftContent}
            {right}
          </Group>

          <Box
            pos="absolute"
            left="50%"
            top="50%"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            {center}
          </Box>
        </Box>
      ) : (
        <Group
          pl="md"
          h={MODULE_HEADER_HEIGHT}
          justify="space-between"
          wrap="nowrap"
        >
          {leftContent}
          {right}
        </Group>
      )}

      {withDivider && <Divider />}
    </>
  );
}

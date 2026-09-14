"use client";

import { Drawer, Title } from "@peppermint/ui";
import { TemplateProfilePanel } from "./TemplateProfilePanel";
import type { TemplateDrawerProps } from "./TemplateDrawer.types";

/**
 * A workflow template as a side surface rather than a route — the same move
 * `WorklistDrawer` made: the template list stays behind it, so reading one
 * template and moving to the next costs no navigation.
 *
 * It costs the list nothing until it is used. A closed Mantine drawer renders
 * no children, so the detail query only runs for a template actually opened,
 * and React Query keeps it — reopening is instant and revalidates behind you.
 */
export function TemplateDrawer({
  templateId,
  opened,
  onClose,
}: TemplateDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={<Title order={4}>Workflow template</Title>}
    >
      {templateId ? <TemplateProfilePanel templateId={templateId} /> : null}
    </Drawer>
  );
}

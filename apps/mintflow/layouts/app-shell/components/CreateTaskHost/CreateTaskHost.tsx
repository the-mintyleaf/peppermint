"use client";

import { Drawer } from "@peppermint/ui";

import { ModuleCreateTask } from "@/modules/create-task";
import { useAppShellStore } from "../../app-shell.store";

/**
 * Hosts the Create Task sheet as a bottom drawer, opened from the ＋ action in
 * either navigation variant. Chrome (overlay, rounded top) lives here so the
 * module only owns the form content.
 */
export function CreateTaskHost() {
  const open = useAppShellStore((s) => s.createTaskOpen);
  const close = useAppShellStore((s) => s.closeCreateTask);

  return (
    <Drawer
      opened={open}
      onClose={close}
      position="bottom"
      size="92%"
      withCloseButton={false}
      padding={0}
      radius="30px 30px 0 0"
      overlayProps={{ backgroundOpacity: 0.32, blur: 1, color: "#0a0c0e" }}
      styles={{
        content: { background: "rgb(252,251,249)" },
        body: { height: "100%" },
      }}
      aria-label="Create task"
    >
      <ModuleCreateTask onClose={close} />
    </Drawer>
  );
}

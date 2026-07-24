"use client";

import { Warning } from "@phosphor-icons/react";
import {
  Box,
  Container,
  Divider,
  Group,
  ModuleHeader,
  Paper,
  Progress,
  Text,
} from "@peppermint/ui";
import { useFormControls } from "../../wrappers/FormWrapper/FormWrapper.hooks";
import { FormShellFooter } from "./components/FormShellFooter";
import { FormShellHeader } from "./components/FormShellHeader";
import { FormShellStepper } from "./components/FormShellStepper";
import type { FormShellProps } from "./FormShell.types";

export function FormShell({
  title,
  description,
  onBack,
  breadcrumbItems = [],
  steps = [],
  disabledSteps = [],
  showStepper = true,
  showDirtyBanner = true,
  allowStepJump = "never",
  onStepBack,
  onStepNext,
  onCancel,
  iconActive,
  iconComplete,
  iconIncomplete,
  children,
}: FormShellProps) {
  const { completionPct, isDirty } = useFormControls();

  const hasSteps = showStepper && steps.length > 0;

  return (
    <>
      <ModuleHeader />

      {/* Title + guarded Back button. Back confirms first when the form is dirty. */}
      <FormShellHeader
        title={title}
        description={description}
        onBack={onBack}
      />

      <Box style={{ flexShrink: 0 }} bg="gray.0">
        {hasSteps && (
          <FormShellStepper
            steps={steps}
            disabledSteps={disabledSteps}
            allowStepJump={allowStepJump}
            iconActive={iconActive}
            iconComplete={iconComplete}
            iconIncomplete={iconIncomplete}
          />
        )}

        {hasSteps && (
          <Progress
            value={completionPct == 0 ? 5 : completionPct}
            size="xs"
            animated
          />
        )}
      </Box>

      {showDirtyBanner && isDirty && (
        <Paper bg="brand.3">
          <Container size="md">
            <Group justify="center">
              <Warning size={14} />
              <Text size="xs">You have unsaved changes</Text>
            </Group>
          </Container>
        </Paper>
      )}

      <Box style={{ flex: 1, overflowY: "auto" }} py="xl">
        <Container size="md">
          <Paper component="div">{children}</Paper>
        </Container>
      </Box>

      <Divider />

      <Box style={{ flexShrink: 0 }}>
        <Container size="md">
          <FormShellFooter
            steps={steps}
            onStepBack={onStepBack}
            onStepNext={onStepNext}
            onCancel={onCancel}
          />
        </Container>
      </Box>
    </>
  );
}

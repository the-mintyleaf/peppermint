"use client";

import { Warning, XIcon, TrashIcon } from "@phosphor-icons/react";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Group,
  ModuleHeader,
  Paper,
  Progress,
  Stack,
  Text,
} from "@zetsel/ui";
import { useFormControls } from "../../wrappers/FormWrapper/FormWrapper.hooks";
import { FormShellFooter } from "./components/FormShellFooter";
import { FormShellStepper } from "./components/FormShellStepper";
import type { FormShellProps } from "./FormShell.types";

export function FormShell({
  title,
  description,
  onBack,
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
      <ModuleHeader
        right={
          <Group gap={0}>
            <Button
              color="orange"
              px="md"
              h={38}
              radius={0}
              size="xs"
              variant="subtle"
              leftSection={<TrashIcon weight="fill" size={14} />}
              onClick={onBack}
            >
              Refill fields
            </Button>

            <Button
              px="md"
              h={38}
              radius={0}
              size="xs"
              variant="light"
              leftSection={<XIcon size={14} />}
              onClick={onBack}
            >
              Cancel
            </Button>
          </Group>
        }
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
            radius={0}
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

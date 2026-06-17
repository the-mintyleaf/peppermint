"use client";

import { Box, Button, Divider, Group } from "@peppermint/ui";
import { ArrowLeft, ArrowRight, Check, X } from "@phosphor-icons/react";
import { useFormControls } from "../../../../wrappers/FormWrapper/FormWrapper.hooks";
import type { FormShellFooterProps, Step } from "../../FormShell.types";

function stepCount(steps: (string | Step)[]): number {
  return steps.length;
}

export function FormShellFooter({
  steps,
  onStepBack,
  onStepNext,
  onCancel,
}: FormShellFooterProps) {
  const { current, isLoading, handleSubmit, handleStepNext, handleStepBack } =
    useFormControls();

  const withStepper = stepCount(steps) > 0;
  const isLastStep = !withStepper || current + 1 === stepCount(steps);
  const isFirstStep = current === 0;

  const doBack = onStepBack ?? handleStepBack;
  const doNext = onStepNext ?? handleStepNext;

  return (
    <Box py="md">
      <Group justify="space-between">
        {withStepper && !isFirstStep ? (
          <Button
            size="xs"
            variant="light"
            leftSection={<ArrowLeft size={14} />}
            onClick={doBack}
            disabled={isLoading}
          >
            Previous Step
          </Button>
        ) : (
          <div />
        )}

        <Group gap="xs">
          {onCancel && (
            <Button
              size="xs"
              variant="default"
              leftSection={<X size={14} />}
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}

          {withStepper && !isLastStep && (
            <Button
              size="xs"
              rightSection={<ArrowRight size={14} />}
              onClick={doNext}
              loading={isLoading}
            >
              Next Step
            </Button>
          )}

          {isLastStep && (
            <Button
              size="xs"
              leftSection={<Check size={14} />}
              onClick={handleSubmit}
              loading={isLoading}
            >
              Submit
            </Button>
          )}
        </Group>
      </Group>
    </Box>
  );
}

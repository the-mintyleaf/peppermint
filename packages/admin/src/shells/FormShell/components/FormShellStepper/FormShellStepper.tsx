"use client";

import { Container, Group, Indicator, Menu, Paper, Text } from "@peppermint/ui";
import { CaretDown } from "@phosphor-icons/react";
import { useFormControls } from "../../../../wrappers/FormWrapper/FormWrapper.hooks";
import type { FormShellStepperProps, Step } from "../../FormShell.types";

function getLabel(step: string | Step): string {
  return typeof step === "string" ? step : step.label;
}

export function FormShellStepper({
  steps,
  disabledSteps = [],
  allowStepJump = "never",
  iconActive,
  iconComplete,
  iconIncomplete,
}: FormShellStepperProps) {
  const { current, stepStatus, handleStepGo } = useFormControls();

  const errorCount = Object.values(stepStatus).filter(
    (s) => s === "error",
  ).length;
  const nextLabel =
    current + 1 < steps.length ? getLabel(steps[current + 1]) : null;

  const isItemClickable = (index: number): boolean => {
    if (disabledSteps.includes(index)) return false;
    if (allowStepJump === "always") return true;
    if (allowStepJump === "completed-only") return index <= current;
    return false;
  };

  const getItemDataAttr = (index: number): string => {
    if (index === current) return "active";
    return stepStatus[index] ?? "pending";
  };

  const getStepIcon = (index: number) => {
    if (index === current) return iconActive;
    if (stepStatus[index] === "complete") return iconComplete;
    return iconIncomplete;
  };

  return (
    <Container size="md">
      <Menu position="bottom" withArrow shadow="lg" width="target">
        <Menu.Target>
          <Indicator
            color="red"
            label={errorCount > 0 ? String(errorCount) : undefined}
            disabled={errorCount === 0}
            size={16}
            offset={4}
          >
            <Paper bg="none" py={"sm"} style={{ cursor: "pointer" }}>
              <Group justify="space-between" wrap="nowrap">
                <Text size="xs" fw={700}>
                  <Text span c="dimmed" fw={400}>
                    Step {current + 1} of {steps.length}:{" "}
                  </Text>
                  {getLabel(steps[current])}
                </Text>
                <Group gap={6} wrap="nowrap">
                  {nextLabel && (
                    <Text size="xs" c="dimmed" fw={500}>
                      Next: {nextLabel}
                    </Text>
                  )}
                  <CaretDown size={14} aria-label="Toggle step menu" />
                </Group>
              </Group>
            </Paper>
          </Indicator>
        </Menu.Target>

        <Menu.Dropdown>
          {steps.map((step, index) => (
            <Menu.Item
              key={index}
              onClick={() => isItemClickable(index) && handleStepGo(index)}
              disabled={!isItemClickable(index)}
            >
              <Group gap="xs">
                {getStepIcon(index)}
                <Text
                  size="xs"
                  fw={700}
                  c={getItemDataAttr(index) === "error" ? "red" : undefined}
                >
                  {index + 1}. {getLabel(step)}
                </Text>
              </Group>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Container>
  );
}

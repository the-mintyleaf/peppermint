import React from 'react';
import { Stepper } from '@zetsel/ui';
import { useFormControls } from '../../../../wrappers/FormWrapper';

interface FormStepperProps {
  steps: string[];
  disabledSteps?: number[];
  enableStepClick?: boolean;
}

export function FormStepper({ steps, disabledSteps = [], enableStepClick = false }: FormStepperProps) {
  const { current, stepStatus, handleStepGo } = useFormControls();

  return (
    <Stepper active={current} p="md">
      {steps.map((label, i) => (
        <Stepper.Step
          key={i}
          label={label}
          color={stepStatus[i] === 'error' ? 'red' : undefined}
          disabled={disabledSteps.includes(i)}
          onClick={enableStepClick && !disabledSteps.includes(i) ? () => handleStepGo(i) : undefined}
          style={enableStepClick && !disabledSteps.includes(i) ? { cursor: 'pointer' } : undefined}
        />
      ))}
    </Stepper>
  );
}

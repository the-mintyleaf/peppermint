import React from 'react';
import { Button, Group } from '@zetsel/ui';
import { useFormControls } from '../../../../wrappers/FormWrapper';

interface FormFooterProps {
  steps?: string[];
  onCancel?: () => void;
}

export function FormFooter({ steps, onCancel }: FormFooterProps) {
  const { current, isLoading, handleSubmit, handleStepNext, handleStepBack } = useFormControls();

  const isMultiStep = steps && steps.length > 1;
  const isLastStep = !isMultiStep || current === steps.length - 1;
  const isFirstStep = current === 0;

  return (
    <Group justify="space-between">
      {onCancel ? (
        <Button variant="subtle" color="gray" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      ) : (
        <span />
      )}
      <Group gap="sm">
        {isMultiStep && !isFirstStep && (
          <Button variant="default" onClick={handleStepBack} disabled={isLoading}>
            ← Back
          </Button>
        )}
        {isLastStep ? (
          <Button onClick={handleSubmit} loading={isLoading}>
            Save
          </Button>
        ) : (
          <Button onClick={handleStepNext} disabled={isLoading}>
            Next →
          </Button>
        )}
      </Group>
    </Group>
  );
}

import React from 'react';
import { FormWrapper, useFormInstance } from '../../wrappers/FormWrapper';
import { useUnsavedWarning } from './FormShell.hooks';
import { FormHeader } from './components/FormHeader';
import { FormStepper } from './components/FormStepper';
import { FormFooter } from './components/FormFooter';
import classes from './FormShell.module.css';
import type { FormShellProps } from './FormShell.types';
import type { FormValues } from '../../wrappers/FormWrapper';

function FormShellInner<T extends FormValues>({
  title,
  bread,
  steps,
  showStepper = true,
  disabledSteps,
  enableStepClick,
  onCancel,
  children,
  hasDirtCheck,
}: Omit<FormShellProps<T>, 'initial' | 'apiSubmitFn' | 'validation' | 'transformFnSubmit' | 'submitSuccessFn' | 'formClearOnSuccess' | 'moduleInfo'>) {
  const { form } = useFormInstance<T>();

  useUnsavedWarning(hasDirtCheck ? form.isDirty() : false);

  const isMultiStep = steps && steps.length > 1;

  return (
    <div className={classes.shell}>
      <FormHeader title={title} bread={bread} />
      {isMultiStep && showStepper && (
        <FormStepper
          steps={steps}
          disabledSteps={disabledSteps}
          enableStepClick={enableStepClick}
        />
      )}
      <div className={classes.body}>{children}</div>
      <div className={classes.footer}>
        <FormFooter steps={steps} onCancel={onCancel} />
      </div>
    </div>
  );
}

export function FormShell<T extends FormValues>({
  initial,
  apiSubmitFn,
  validation,
  transformFnSubmit,
  submitSuccessFn,
  hasDirtCheck,
  formClearOnSuccess,
  steps,
  ...rest
}: FormShellProps<T>) {
  const stepFields = steps?.map((_, i) => [`step_${i}`]);

  return (
    <FormWrapper<T>
      initial={initial}
      apiSubmitFn={apiSubmitFn}
      validation={validation as FormShellProps<T>['validation']}
      transformFnSubmit={transformFnSubmit}
      submitSuccessFn={submitSuccessFn}
      hasDirtCheck={hasDirtCheck}
      formClearOnSuccess={formClearOnSuccess}
      stepFields={stepFields}
    >
      <FormShellInner<T> hasDirtCheck={hasDirtCheck} steps={steps} {...rest} />
    </FormWrapper>
  );
}

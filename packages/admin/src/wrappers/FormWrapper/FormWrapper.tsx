import React, { useRef, useState, useCallback, useMemo } from 'react';
import { useForm } from '@mantine/form';
import type { FormValidateInput } from '@mantine/form';
import { zodResolver } from '@zetsel/utils';
import { triggerNotification } from '../../notification';
import { FormInstanceContext, FormControlsContext } from './FormWrapper.context';
import { validateStep } from './FormWrapper.utils';
import type { FormWrapperProps, FormValues, StepStatus } from './FormWrapper.types';

export function FormWrapper<T extends FormValues>({
  initial,
  apiSubmitFn,
  validation,
  transformFnSubmit,
  submitSuccessFn,
  stepFields,
  formClearOnSuccess,
  children,
}: FormWrapperProps<T>) {
  // Rule 1 — initialise once: capture initial via ref, never re-read
  const initialRef = useRef<T>(initial);

  const totalSteps = stepFields?.length ?? 1;

  const form = useForm<T>({
    initialValues: initialRef.current,
    // Rule 2 — validate on blur only, never on change
    validateInputOnChange: false,
    validateInputOnBlur: true,
    validate: validation?.[0]
      ? (zodResolver(validation[0] as import('zod').ZodType<T>) as unknown as FormValidateInput<T>)
      : undefined,
  });

  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [stepStatus, setStepStatus] = useState<Record<number, StepStatus>>({});

  function markStep(index: number, status: StepStatus) {
    setStepStatus((prev) => ({ ...prev, [index]: status }));
  }

  const completionPct = useMemo(() => {
    if (totalSteps <= 1) return 0;
    const completed = Object.values(stepStatus).filter((s) => s === 'complete').length;
    return Math.round((completed / totalSteps) * 100);
  }, [stepStatus, totalSteps]);

  // Rule 3 — synchronous submit guard: isLoading set before first await
  const handleSubmit = useCallback(async () => {
    if (isLoading) return;
    if (!form.validate().hasErrors === false) return;

    setIsLoading(true);
    triggerNotification.form.isLoading();

    // Rule 4 — deep clone before transform
    const cloned = structuredClone(form.values) as T;
    const payload = transformFnSubmit ? transformFnSubmit(cloned) : cloned;

    try {
      await apiSubmitFn(payload);
      triggerNotification.form.isSuccess();
      submitSuccessFn?.();
      // Rule 5 (modal) and formClearOnSuccess
      if (formClearOnSuccess) form.reset();
      markStep(current, 'complete');
    } catch {
      triggerNotification.form.isError();
      markStep(current, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, form, apiSubmitFn, transformFnSubmit, submitSuccessFn, formClearOnSuccess, current]);

  const handleStepNext = useCallback(() => {
    // Rule 2 / Rule 7 — per-step validation scoped to current step's fields only
    const fields = stepFields?.[current] ?? [];
    const valid = fields.length === 0 || validateStep(form as unknown as Parameters<typeof validateStep>[0], fields);
    if (!valid) {
      markStep(current, 'error');
      return;
    }
    markStep(current, 'complete');
    setCurrent((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [current, stepFields, form, totalSteps]);

  const handleStepBack = useCallback(() => {
    setCurrent((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepGo = useCallback((step: number) => {
    setCurrent(Math.max(0, Math.min(step, totalSteps - 1)));
  }, [totalSteps]);

  // FormInstanceContext value — stable object ref: memoised so it never re-provides
  const instanceValue = useMemo(
    () => ({ form: form as unknown as Parameters<typeof FormInstanceContext.Provider>[0]['value'] extends { form: infer F } ? F : never }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // intentionally empty — form object is stable
  );

  const controlsValue = useMemo(
    () => ({ current, isLoading, stepStatus, completionPct, handleSubmit, handleStepNext, handleStepBack, handleStepGo }),
    [current, isLoading, stepStatus, completionPct, handleSubmit, handleStepNext, handleStepBack, handleStepGo]
  );

  return (
    <FormInstanceContext.Provider value={{ form: form as never }}>
      <FormControlsContext.Provider value={controlsValue}>
        {children}
      </FormControlsContext.Provider>
    </FormInstanceContext.Provider>
  );
}

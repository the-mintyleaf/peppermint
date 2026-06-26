"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { ZodSchema } from "zod";
import type { FormValidateInput } from "@mantine/form";
import {
  FormInstanceContext,
  FormControlsContext,
} from "./FormWrapper.context";
import { validateStep } from "./FormWrapper.utils";
import type {
  FormWrapperProps,
  FormValues,
  FormInstanceContextValue,
  StepStatus,
} from "./FormWrapper.types";

export function FormWrapper<T extends FormValues>({
  initial,
  stepApiConfigs,
  finalSubmitFn,
  onStepSuccess,
  validation,
  stepFields,
  disabledSteps,
  formClearOnSuccess,
  hasDirtCheck,
  children,
}: FormWrapperProps<T>) {
  // Captured once at mount, never re-read from props
  const initialRef = useRef(initial);
  const validationRef = useRef(validation);

  // Refs for props used inside callbacks — avoids stale closures without
  // adding them to useCallback deps and triggering unnecessary re-creation.
  const stepFieldsRef = useRef(stepFields);
  stepFieldsRef.current = stepFields;
  const disabledStepsRef = useRef(disabledSteps);
  disabledStepsRef.current = disabledSteps;
  const stepApiConfigsRef = useRef(stepApiConfigs);
  stepApiConfigsRef.current = stepApiConfigs;
  const finalSubmitFnRef = useRef(finalSubmitFn);
  finalSubmitFnRef.current = finalSubmitFn;
  const onStepSuccessRef = useRef(onStepSuccess);
  onStepSuccessRef.current = onStepSuccess;
  const formClearOnSuccessRef = useRef(formClearOnSuccess);
  formClearOnSuccessRef.current = formClearOnSuccess;

  const totalSteps = stepFields?.length ?? 1;
  const totalStepsRef = useRef(totalSteps);
  totalStepsRef.current = totalSteps;

  // hasDirtCheck is treated as mount-time — not expected to change after mount.
  const hasDirtCheckRef = useRef(hasDirtCheck);

  // Build a plain validate function from all schemas.
  // zodResolver returns a Proxy — spreading it copies nothing, so we compose manually.
  // First error per path wins (earlier steps take precedence).
  const validateFn = useMemo((): FormValidateInput<T> | undefined => {
    const schemas = validationRef.current?.filter(Boolean);
    if (!schemas?.length) return undefined;
    return (values: T) => {
      const errors: Record<string, string | null> = {};
      for (const schema of schemas) {
        const result = (schema as ZodSchema).safeParse(values);
        if (!result.success) {
          for (const issue of result.error.issues) {
            const path = issue.path.map(String).join(".");
            if (path && !(path in errors)) errors[path] = issue.message;
          }
        }
      }
      return errors;
    };
  }, []); // empty deps — derived once from ref

  // Validate on blur only
  const form = useForm<T>({
    mode: "controlled",
    initialValues: initialRef.current,
    validate: validateFn,
    validateInputOnChange: false,
    validateInputOnBlur: true,
  });

  // form is stable in Mantine controlled mode — ref lets callbacks access the
  // live instance without listing form as a dep.
  const formRef = useRef(form);
  formRef.current = form;

  const [current, setCurrent] = useState(0);
  // currentRef lets callbacks read the latest step without closing over stale state.
  const currentRef = useRef(0);
  currentRef.current = current;

  const [isLoading, setIsLoading] = useState(false);
  // isLoadingRef provides a synchronous in-flight guard — setIsLoading is batched
  // so reading the state value inside the same callback would give a stale false.
  const isLoadingRef = useRef(false);

  const [stepStatus, setStepStatus] = useState<Record<number, StepStatus>>(() =>
    Object.fromEntries(
      Array.from({ length: totalSteps }, (_, i) => [
        i,
        "pending" as StepStatus,
      ]),
    ),
  );

  // IDs returned by per-step API calls, keyed by step index.
  const [stepIds, setStepIds] = useState<Record<number, string>>({});
  // stepIdsRef keeps a synchronous mirror so callbacks can read the latest map
  // without re-closing over state (state reads inside callbacks are stale).
  const stepIdsRef = useRef<Record<number, string>>({});

  const setStepIdsSync = (
    updater: (prev: Record<number, string>) => Record<number, string>,
  ) => {
    setStepIds((prev) => {
      const next = updater(prev);
      stepIdsRef.current = next;
      return next;
    });
  };

  // Derived once per stepStatus change — not recomputed inline inside controlsValue memo.
  const completionPct = useMemo(() => {
    if (totalSteps <= 1) return 0;
    const completed = Object.values(stepStatus).filter(
      (s) => s === "complete",
    ).length;
    return Math.round((completed / totalSteps) * 100);
  }, [stepStatus, totalSteps]);

  // Extracts only the fields belonging to a step from full form values.
  // Returns full values when no field list is configured for the step.
  const extractStepData = (stepIndex: number): Partial<T> => {
    const fields = stepFieldsRef.current?.[stepIndex];
    if (!fields?.length) return formRef.current.values as T;
    const values = formRef.current.values;
    return Object.fromEntries(
      fields.map((key) => [key, values[key]]),
    ) as Partial<T>;
  };

  // Calls the create or patch API for a given step based on whether an ID exists.
  // Returns true if the call succeeded, false otherwise.
  const callStepApi = async (stepIndex: number): Promise<boolean> => {
    const config = stepApiConfigsRef.current?.[stepIndex];
    if (!config) return true; // no API config — treat as success

    const data = extractStepData(stepIndex);
    const ids = stepIdsRef.current;
    const existingId = ids[stepIndex];

    const response =
      existingId && config.patchFn
        ? await config.patchFn(existingId, data, ids)
        : await config.createFn(data, ids);

    if (!response.ok) {
      notifications.show({
        color: "red",
        title: "Error",
        message: response.message ?? "Something went wrong.",
      });
      setStepStatus((prev) => ({ ...prev, [stepIndex]: "error" }));
      return false;
    }

    const returnedId = (response.data as { id?: string } | undefined)?.id;
    if (returnedId) {
      setStepIdsSync((prev) => ({ ...prev, [stepIndex]: returnedId }));
    }

    onStepSuccessRef.current?.(stepIndex, returnedId, response.data);
    return true;
  };

  // Validate only stepFields[current] on next, then optionally fire the step API.
  // All mutable values read via refs so this callback is stable (never recreated).
  const handleStepNext = useCallback(async () => {
    if (isLoadingRef.current) return;

    const cur = currentRef.current;
    const fields = stepFieldsRef.current?.[cur] ?? [];

    if (fields.length > 0) {
      const schema = validationRef.current?.[cur] as ZodSchema | undefined;
      const valid = validateStep(
        formRef.current as unknown as ReturnType<typeof useForm<FormValues>>,
        fields,
        schema,
      );
      if (!valid) {
        setStepStatus((prev) => ({ ...prev, [cur]: "error" }));
        return;
      }
    }

    const config = stepApiConfigsRef.current?.[cur];
    if (config?.mode === "on-next") {
      isLoadingRef.current = true;
      setIsLoading(true);
      const ok = await callStepApi(cur);
      isLoadingRef.current = false;
      setIsLoading(false);
      if (!ok) return;
    }

    setStepStatus((prev) => ({ ...prev, [cur]: "complete" }));

    let next = cur + 1;
    const disabled = disabledStepsRef.current;
    const steps = totalStepsRef.current;
    while (next < steps - 1 && disabled?.includes(next)) next++;
    setCurrent(Math.min(next, steps - 1));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStepBack = useCallback(() => {
    const cur = currentRef.current;
    let prev = cur - 1;
    const disabled = disabledStepsRef.current;
    while (prev > 0 && disabled?.includes(prev)) prev--;
    setCurrent(Math.max(prev, 0));
  }, []);

  const handleStepGo = useCallback((step: number) => {
    if (step >= 0 && step < totalStepsRef.current) setCurrent(step);
  }, []);

  // On final submit:
  // 1. Validate all fields
  // 2. Run all on-submit step APIs in sequence
  // 3. Call finalSubmitFn if provided
  const handleSubmit = useCallback(async () => {
    if (isLoadingRef.current) return;

    const f = formRef.current;
    const { hasErrors } = f.validate();
    if (hasErrors) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    const configs = stepApiConfigsRef.current ?? [];
    for (let i = 0; i < configs.length; i++) {
      if (configs[i]?.mode === "on-submit") {
        const ok = await callStepApi(i);
        if (!ok) {
          isLoadingRef.current = false;
          setIsLoading(false);
          return;
        }
      }
    }

    const finalFn = finalSubmitFnRef.current;
    if (finalFn) {
      const clone = structuredClone(f.values) as T;
      const response = await finalFn(clone, stepIdsRef.current);
      if (!response.ok) {
        notifications.show({
          color: "red",
          title: "Error",
          message: response.message ?? "Something went wrong.",
        });
        setStepStatus((prev) => ({ ...prev, [currentRef.current]: "error" }));
        isLoadingRef.current = false;
        setIsLoading(false);
        return;
      }
    }

    if (formClearOnSuccessRef.current) f.reset();
    isLoadingRef.current = false;
    setIsLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // form is a new reference on every render in Mantine controlled mode.
  // Including it in deps means field components re-render when values change
  // (needed to show typed input) but not when nav or submit state changes
  // (those live in FormControlsContext only).
  const instanceValue = useMemo(
    () => ({ form }) as FormInstanceContextValue<FormValues>,
    [form], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // isDirty: when hasDirtCheck is active, form.isDirty() re-evaluates on every
  // render caused by form.values changing — that's intentional and correct.
  // When inactive it's always false and contributes no re-renders.
  const isDirty = hasDirtCheckRef.current ? form.isDirty() : false;

  const controlsValue = useMemo(
    () => ({
      current,
      isLoading,
      stepStatus,
      stepIds,
      completionPct,
      isDirty,
      handleSubmit,
      handleStepNext,
      handleStepBack,
      handleStepGo,
    }),
    [
      current,
      isLoading,
      stepStatus,
      stepIds,
      completionPct,
      isDirty,
      handleSubmit,
      handleStepNext,
      handleStepBack,
      handleStepGo,
    ],
  );

  return (
    <FormInstanceContext.Provider value={instanceValue}>
      <FormControlsContext.Provider value={controlsValue}>
        {children}
      </FormControlsContext.Provider>
    </FormInstanceContext.Provider>
  );
}

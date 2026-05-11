import type { UseFormReturnType } from '@mantine/form';
import type { FormValues } from './FormWrapper.types';

export function validateStep(form: UseFormReturnType<FormValues>, fieldKeys: string[]): boolean {
  fieldKeys.forEach((key) => form.validateField(key as never));
  return fieldKeys.every((key) => !form.errors[key]);
}

export function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => (a as Record<string, unknown>)[k] === (b as Record<string, unknown>)[k]);
}

export function draftSerialize(values: unknown): string {
  try {
    return JSON.stringify(values);
  } catch {
    return '';
  }
}

import type { ZodSchema } from 'zod';
import type { UseFormReturnType } from '@mantine/form';
import type { FormValues } from './FormWrapper.types';

/**
 * Validates only the fields belonging to the current step.
 *
 * Runs the step's Zod schema (if provided) directly via safeParse so that
 * only that schema's errors are evaluated — the full-form merged validator
 * is never touched. The resulting errors are written onto the form via
 * setErrors so nested list paths (e.g. breadcrumbs.0.label) surface on the
 * correct field inputs.
 *
 * Falls back to full form.validate() filtered by fieldKeys when no schema is
 * provided for the step.
 *
 * Returns true when the step has no errors.
 */
export function validateStep(
  form: UseFormReturnType<FormValues>,
  fieldKeys: string[],
  schema?: ZodSchema
): boolean {
  if (schema) {
    const result = schema.safeParse(form.values);
    if (result.success) {
      // Clear any lingering errors on this step's fields
      const cleared = Object.fromEntries(fieldKeys.map((k) => [k, null]));
      form.setErrors(cleared);
      return true;
    }
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.map(String).join('.');
      if (path && !(path in errors)) errors[path] = issue.message;
    }
    form.setErrors(errors);
    return false;
  }

  // No schema — fall back to form.validate() scoped to this step's field prefixes
  const { errors } = form.validate();
  return !Object.keys(errors).some((errorPath) =>
    fieldKeys.some((key) => errorPath === key || errorPath.startsWith(key + '.'))
  );
}

/**
 * Shallow comparison of two plain objects. Top-level keys only — does not recurse.
 */
export function shallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => Object.is(a[key], b[key]));
}

/**
 * Serializes form values to a JSON string for draft storage.
 * Returns '' on failure. Never throws.
 */
export function draftSerialize(values: unknown): string {
  try {
    return JSON.stringify(values);
  } catch {
    return '';
  }
}

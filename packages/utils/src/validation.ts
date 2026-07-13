import { ZodSchema } from "zod";

type FormValues = Record<string, unknown>;
type MantineValidateRecord = Record<
  string,
  (value: unknown, values: FormValues) => string | null
>;

export function zodResolver<T extends FormValues>(
  schema: ZodSchema<T>,
): MantineValidateRecord {
  // Mantine calls each field's validator with the same `values` reference during
  // one validation pass. Cache the parse per `values` object so the schema is
  // parsed once per pass instead of once per field (was O(fields) parses).
  let cachedValues: FormValues | undefined;
  let cachedErrors: Map<string, string> | null = null;

  const errorsFor = (values: FormValues): Map<string, string> => {
    if (cachedValues === values && cachedErrors) return cachedErrors;
    const errors = new Map<string, string>();
    const result = schema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const dotPath = issue.path.map(String).join(".");
        if (!errors.has(dotPath)) errors.set(dotPath, issue.message);
      }
    }
    cachedValues = values;
    cachedErrors = errors;
    return errors;
  };

  return new Proxy({} as MantineValidateRecord, {
    get(_target, field: string) {
      return (_value: unknown, values: FormValues) =>
        errorsFor(values).get(field) ?? null;
    },
    has() {
      return true;
    },
  });
}

export function parseOrNull<T>(schema: ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

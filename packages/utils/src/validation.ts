import { ZodSchema } from 'zod';

type FormValues = Record<string, unknown>;
type MantineValidateRecord = Record<string, (value: unknown, values: FormValues) => string | null>;

export function zodResolver<T extends FormValues>(schema: ZodSchema<T>): MantineValidateRecord {
  return new Proxy({} as MantineValidateRecord, {
    get(_target, field: string) {
      return (value: unknown, values: FormValues) => {
        const result = schema.safeParse(values);
        if (result.success) return null;
        const issue = result.error.issues.find((i) => {
          const dotPath = i.path.map(String).join('.');
          return dotPath === field;
        });
        return issue?.message ?? null;
      };
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

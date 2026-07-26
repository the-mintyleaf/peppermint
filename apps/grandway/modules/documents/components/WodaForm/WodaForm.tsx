"use client";

import { type ReactNode, useMemo } from "react";
import {
  Autocomplete,
  Button,
  DateInput,
  Input,
  NumberInput,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Switch,
  TextInput,
  Textarea,
  useForm,
} from "@peppermint/ui";
import { FormSection } from "@/components/FormSection";
import type { DocumentContent } from "../../documents.types";
import type { WodaField, WodaSelectOption } from "../../utils/wodaFormSchema";
import { OccupationsField } from "./OccupationsField";
import type { WodaFormProps } from "./WodaForm.types";

type WodaFormValues = Record<string, unknown>;

/** Every field in the schema, flattened — used to build defaults and validation once. */
function collectFields(schema: WodaFormProps["schema"]): WodaField[] {
  return schema.sections.flatMap((section) => section.fields);
}

/** Coerce any raw value into a finite number (empty/NaN → 0). */
function toFiniteNumber(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Control-appropriate empty value for a field with no explicit default. */
function emptyValue(field: WodaField): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  switch (field.control) {
    case "occupations":
      return [];
    case "number":
      return 0;
    case "switch":
      return false;
    default:
      return "";
  }
}

/** Normalize a raw content value into the shape the control expects. */
function coerceValue(field: WodaField, raw: unknown): unknown {
  switch (field.control) {
    case "occupations":
      return Array.isArray(raw) ? raw : [];
    case "number":
      return toFiniteNumber(raw);
    case "switch":
      return Boolean(raw);
    default:
      return raw ?? "";
  }
}

/**
 * Coerce number-bearing values back to numbers before submit. Mantine `NumberInput`
 * yields `""` when a field is cleared, and the templates call `.toFixed`/arithmetic on
 * these values — so an empty string would crash the render or concatenate into totals.
 */
function normalizeForSubmit(
  fields: WodaField[],
  values: WodaFormValues,
): WodaFormValues {
  const out: WodaFormValues = { ...values };
  for (const field of fields) {
    if (field.control === "number") {
      out[field.name] = toFiniteNumber(out[field.name]);
    } else if (field.control === "occupations") {
      const numberKeys = (field.occupationColumns ?? [])
        .filter((col) => col.type === "number")
        .map((col) => col.key);
      const rows = Array.isArray(out[field.name])
        ? (out[field.name] as Record<string, unknown>[])
        : [];
      out[field.name] = rows.map((row) => {
        const next = { ...row };
        for (const key of numberKeys) next[key] = toFiniteNumber(next[key]);
        return next;
      });
    }
  }
  return out;
}

/** Required-field validator that respects each control's notion of "empty". */
function requiredValidator(
  field: WodaField,
): (value: unknown) => string | null {
  const message = `${field.label} is required`;
  return (value) => {
    switch (field.control) {
      case "number":
        // 0 is a valid answer; only an unset/empty value fails.
        return value === "" || value === null || value === undefined
          ? message
          : null;
      case "switch":
        return value ? null : message;
      case "occupations":
        return Array.isArray(value) && value.length > 0 ? null : message;
      default:
        return !value || (typeof value === "string" && !value.trim())
          ? message
          : null;
    }
  };
}

function segmentedData(
  options: (string | WodaSelectOption)[] = [],
): { label: string; value: string }[] {
  return options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );
}

function comboboxData(options: (string | WodaSelectOption)[] = []): string[] {
  return options.map((opt) => (typeof opt === "string" ? opt : opt.value));
}

function fieldLabel(field: WodaField): string {
  return field.optional ? `${field.label} (optional)` : field.label;
}

/**
 * Schema-driven renderer for every WODA create/edit form. Picks the right control per
 * field, groups fields into accessible `Fieldset` sections, pairs half-width fields onto
 * one row, and merges saved `initialContent` over the schema defaults so editing an
 * existing document opens prefilled (the old factory opened blank and discarded values).
 */
export function WodaForm(props: WodaFormProps) {
  const { schema, initialContent, onSubmit, isLoading } = props;

  const fields = useMemo(() => collectFields(schema), [schema]);

  const initialValues = useMemo<WodaFormValues>(() => {
    const values: WodaFormValues = {};
    for (const field of fields) values[field.name] = emptyValue(field);
    const existing = (initialContent ?? {}) as WodaFormValues;
    // Preserve any passthrough keys (details, headerProps, …) not owned by the schema.
    Object.assign(values, existing);
    for (const field of fields) {
      values[field.name] = coerceValue(field, values[field.name]);
    }
    return values;
    // initialContent is read once at mount, matching the sibling document forms.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<WodaFormValues>({
    mode: "controlled",
    initialValues,
    validate: Object.fromEntries(
      fields
        .filter((field) => field.required)
        .map((field) => [field.name, requiredValidator(field)]),
    ),
  });

  const renderControl = (field: WodaField): ReactNode => {
    const disabled = isLoading;
    const label = fieldLabel(field);

    switch (field.control) {
      case "textarea":
        return (
          <Textarea
            label={label}
            autosize
            minRows={2}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            disabled={disabled}
            {...form.getInputProps(field.name)}
          />
        );
      case "number":
        return (
          <NumberInput
            label={label}
            hideControls
            min={field.min ?? 0}
            max={field.max}
            decimalScale={field.decimalScale}
            prefix={field.prefix}
            suffix={field.suffix}
            thousandSeparator={field.thousandSeparator ? "," : undefined}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            disabled={disabled}
            {...form.getInputProps(field.name)}
          />
        );
      case "combobox":
        return (
          <Autocomplete
            label={label}
            data={comboboxData(field.options)}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            disabled={disabled}
            {...form.getInputProps(field.name)}
          />
        );
      case "segmented": {
        // Input.Wrapper renders the accessible label/description/error; the group gets
        // its name via aria-label. Only value/onChange are forwarded — spreading the full
        // getInputProps would leak `error` onto the DOM and SegmentedControl shows none.
        const inputProps = form.getInputProps(field.name);
        return (
          <Input.Wrapper
            label={label}
            required={field.required}
            description={field.description}
            error={inputProps.error}
          >
            <SegmentedControl
              fullWidth
              mt={4}
              data={segmentedData(field.options)}
              disabled={disabled}
              aria-label={label}
              value={(inputProps.value as string) ?? ""}
              onChange={inputProps.onChange}
            />
          </Input.Wrapper>
        );
      }
      case "switch":
        return (
          <Switch
            label={label}
            description={field.description}
            disabled={disabled}
            {...form.getInputProps(field.name, { type: "checkbox" })}
          />
        );
      case "date-ad":
        return (
          <DateInput
            label={label}
            valueFormat="YYYY-MM-DD"
            clearable
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            disabled={disabled}
            {...form.getInputProps(field.name)}
          />
        );
      case "date-bs":
        return (
          <TextInput
            label={label}
            placeholder={field.placeholder ?? "2081-04-15"}
            description={field.description ?? "Bikram Sambat (B.S.)"}
            required={field.required}
            disabled={disabled}
            {...form.getInputProps(field.name)}
          />
        );
      case "occupations":
        return (
          <OccupationsField
            form={form}
            name={field.name}
            label={label}
            description={field.description}
            columns={field.occupationColumns ?? []}
            disabled={disabled}
          />
        );
      default:
        return (
          <TextInput
            label={label}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            disabled={disabled}
            {...form.getInputProps(field.name)}
          />
        );
    }
  };

  // Greedily pair consecutive half-width fields onto one responsive row.
  const renderFields = (sectionFields: WodaField[]): ReactNode[] => {
    const rows: ReactNode[] = [];
    for (let i = 0; i < sectionFields.length; i += 1) {
      const field = sectionFields[i];
      const next = sectionFields[i + 1];
      if (field.half && next?.half) {
        rows.push(
          <SimpleGrid key={field.name} cols={{ base: 1, sm: 2 }} spacing="sm">
            {renderControl(field)}
            {renderControl(next)}
          </SimpleGrid>,
        );
        i += 1;
        continue;
      }
      rows.push(<div key={field.name}>{renderControl(field)}</div>);
    }
    return rows;
  };

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(normalizeForSubmit(fields, values) as DocumentContent);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg" p="md">
        {schema.sections.map((section) => (
          <FormSection
            key={section.title}
            title={section.title}
            description={section.description}
          >
            {renderFields(section.fields)}
          </FormSection>
        ))}
        <Button type="submit" loading={isLoading} fullWidth>
          {schema.submitLabel ?? "Create Document"}
        </Button>
      </Stack>
    </form>
  );
}

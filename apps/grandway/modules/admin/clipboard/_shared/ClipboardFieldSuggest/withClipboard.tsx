"use client";

import {
  deriveFieldKey,
  derivedFieldKeyLabel,
  fieldKeyLabel,
} from "../../clipboard.fieldKeys";
import { ClipboardFieldSuggest } from "./ClipboardFieldSuggest";
import type {
  BindClipboardFieldsOptions,
  ClipboardBindableForm,
  ClipboardFieldBinder,
  ClipboardInputSectionProps,
  WithClipboardOptions,
} from "./ClipboardFieldSuggest.types";

// A Textarea's section is full-height and centred; pin the button beside the first
// line instead, where it sits for a one-row input.
const MULTILINE_SECTION_PROPS = {
  style: {
    alignItems: "flex-start",
    paddingTop: "calc(var(--mantine-spacing-xs) / 2)",
  },
} as const;

/**
 * Puts the saved-snippets button in a Mantine `TextInput` / `Textarea`'s right
 * section — spread it after the input's own props:
 *
 *   <TextInput {...form.getInputProps("x")} {...withClipboard({ fieldKey, value, onInsert })} />
 *
 * Only for free-text inputs: never number, date, select, switch or segmented controls.
 */
export function withClipboard({
  multiline = false,
  size = "sm",
  ...suggest
}: WithClipboardOptions): ClipboardInputSectionProps {
  return {
    rightSection: <ClipboardFieldSuggest size={size} {...suggest} />,
    // Mantine sections ignore the pointer by default; this one is a button.
    rightSectionPointerEvents: "all",
    ...(multiline ? { rightSectionProps: MULTILINE_SECTION_PROPS } : {}),
  };
}

/**
 * Binds the clipboard button to a Mantine form (`useForm`, or FormWrapper's
 * `useFormInstance().form`), so each text field takes one spread:
 *
 *   const clip = bindClipboardFields(form, { family: "cv", disabled: isLoading });
 *   <TextInput label="Nationality" {...form.getInputProps("nationality")}
 *     {...clip("nationality", "Nationality")} />
 *
 * The key is `overrides.clipboardKey` when given (a registered key), else
 * `deriveFieldKey(family, path)`. A snippet is inserted through the field's own form
 * `onChange` — the same path as typing — so validation and dirty state follow.
 */
export function bindClipboardFields(
  form: ClipboardBindableForm,
  { family, disabled, popoverZIndex }: BindClipboardFieldsOptions,
): ClipboardFieldBinder {
  return (path, label, overrides = {}) => {
    const input = form.getInputProps(path);
    const explicitKey = overrides.clipboardKey;
    return withClipboard({
      fieldKey: explicitKey ?? deriveFieldKey(family, path),
      fieldKeyLabel: explicitKey
        ? fieldKeyLabel(explicitKey)
        : derivedFieldKeyLabel(family, label),
      fieldLabel: label,
      value: typeof input.value === "string" ? input.value : "",
      onInsert: (text) => input.onChange(text),
      disabled: overrides.disabled ?? disabled,
      multiline: overrides.multiline,
      popoverZIndex,
    });
  };
}

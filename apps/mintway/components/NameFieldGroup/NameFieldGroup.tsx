"use client";

import { Input } from "@peppermint/ui";
import classes from "./NameFieldGroup.module.css";
import type { NameFieldGroupProps } from "./NameFieldGroup.types";

/**
 * First / Middle / Last name as one visually joined control — three unstyled
 * inputs sharing a single border with hairline dividers between them, so the
 * name reads as one field instead of three unrelated ones. Each segment binds to
 * its own `form.getInputProps(...)`; the group border reflects any segment error.
 */
export function NameFieldGroup({
  label = "Name",
  required,
  lastNameRequired = required,
  disabled,
  firstName,
  middleName,
  lastName,
}: NameFieldGroupProps) {
  const error = firstName.error || middleName.error || lastName.error;
  const groupClassName = [
    classes.group,
    error ? classes.groupError : "",
    disabled ? classes.groupDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Input.Wrapper
      // A group of three inputs has no single control to point `htmlFor` at, so
      // render the label as a plain <div> instead of an orphaned <label>. Each
      // segment carries its own aria-label for screen readers.
      labelElement="div"
      label={label}
      required={required}
      error={error}
      styles={{ label: { fontSize: "var(--mantine-font-size-xs)" } }}
    >
      <div className={groupClassName}>
        <Input
          size="xs"
          variant="unstyled"
          className={classes.segment}
          px="sm"
          py={2}
          placeholder="First"
          disabled={disabled}
          required={required}
          aria-label="First name"
          aria-required={required}
          {...firstName}
        />
        <div className={classes.divider} aria-hidden />
        <Input
          size="xs"
          variant="unstyled"
          className={classes.segment}
          px="sm"
          py={2}
          placeholder="Middle (optional)"
          disabled={disabled}
          aria-label="Middle name"
          {...middleName}
        />
        <div className={classes.divider} aria-hidden />
        <Input
          size="xs"
          variant="unstyled"
          className={classes.segment}
          px="sm"
          py={2}
          placeholder={lastNameRequired ? "Last" : "Last (optional)"}
          disabled={disabled}
          required={lastNameRequired}
          aria-label="Last name"
          aria-required={lastNameRequired}
          {...lastName}
        />
      </div>
    </Input.Wrapper>
  );
}

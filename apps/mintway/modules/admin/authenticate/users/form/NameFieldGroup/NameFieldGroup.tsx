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
    <Input.Wrapper label={label} required={required} error={error}>
      <div className={groupClassName}>
        <Input
          variant="unstyled"
          className={classes.segment}
          px="sm"
          placeholder="First"
          disabled={disabled}
          aria-label="First name"
          {...firstName}
        />
        <div className={classes.divider} aria-hidden />
        <Input
          variant="unstyled"
          className={classes.segment}
          px="sm"
          placeholder="Middle"
          disabled={disabled}
          aria-label="Middle name"
          {...middleName}
        />
        <div className={classes.divider} aria-hidden />
        <Input
          variant="unstyled"
          className={classes.segment}
          px="sm"
          placeholder="Last"
          disabled={disabled}
          aria-label="Last name"
          {...lastName}
        />
      </div>
    </Input.Wrapper>
  );
}

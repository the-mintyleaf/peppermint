"use client";

import { Textarea } from "@peppermint/ui";

import type { ReasonTextareaProps } from "./ReasonTextarea.types";

export function ReasonTextarea({
  value,
  onChange,
  required,
  label = "Reason",
  placeholder = "Explain why this change is being made",
  description,
  error,
}: ReasonTextareaProps) {
  return (
    <Textarea
      label={label}
      description={description}
      placeholder={placeholder}
      required={required}
      minRows={2}
      autosize
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      error={error}
    />
  );
}

"use client";

import {
  ActionIcon,
  Box,
  Button,
  DateInput,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { FormSection } from "@/components/FormSection";
import { CONDITION_TYPE_OPTIONS } from "../../offers.labels";
import type {
  ConditionDraft,
  OfferCreateValues,
} from "../OfferCreateForm.types";

const EMPTY_CONDITION: ConditionDraft = {
  condition_type: "academic_result",
  description: "",
  due_date: null,
};

/**
 * Inline conditions to create alongside the offer. Optional — an unconditional
 * offer needs none, and conditions can be added later on the detail page too.
 * Rows with a blank description are dropped before submit (see the create
 * form's payload mapper).
 */
export function ConditionsRepeater({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<OfferCreateValues>();
  const conditions = form.values.conditions;

  return (
    <FormSection
      title="Conditions (optional)"
      actions={
        <Button
          variant="subtle"
          size="xs"
          leftSection={<PlusIcon size={14} aria-hidden />}
          disabled={isLoading}
          onClick={() =>
            form.insertListItem("conditions", { ...EMPTY_CONDITION })
          }
        >
          Add condition
        </Button>
      }
    >
      {conditions.length === 0 ? (
        <Text size="xs" c="dimmed">
          No conditions yet. Add any the applicant must satisfy.
        </Text>
      ) : null}

      {conditions.map((_, index) => (
        <Box key={index}>
          <Group align="flex-start" gap="xs" wrap="nowrap">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Group grow align="flex-start">
                <Select
                  label="Type"
                  data={CONDITION_TYPE_OPTIONS}
                  allowDeselect={false}
                  disabled={isLoading}
                  {...form.getInputProps(`conditions.${index}.condition_type`)}
                />
                <DateInput
                  label="Due date"
                  valueFormat="YYYY-MM-DD"
                  clearable
                  disabled={isLoading}
                  {...form.getInputProps(`conditions.${index}.due_date`)}
                />
              </Group>
              <Textarea
                label="Description"
                placeholder="e.g. Achieve IELTS 6.5 with no band below 6.0"
                autosize
                minRows={1}
                disabled={isLoading}
                {...form.getInputProps(`conditions.${index}.description`)}
              />
            </Stack>
            <ActionIcon
              variant="subtle"
              color="red"
              mt={28}
              aria-label={`Remove condition ${index + 1}`}
              disabled={isLoading}
              onClick={() => form.removeListItem("conditions", index)}
            >
              <TrashIcon size={16} aria-hidden />
            </ActionIcon>
          </Group>
        </Box>
      ))}
    </FormSection>
  );
}

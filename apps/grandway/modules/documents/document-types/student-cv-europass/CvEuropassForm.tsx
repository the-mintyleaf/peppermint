"use client";

import {
  Stack,
  Group,
  Button,
  ActionIcon,
  Divider,
  Text,
  TextInput,
  Textarea,
  Select,
  useForm,
} from "@peppermint/ui";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { DEFAULT_EUROPASS_APPEARANCE } from "@/components/templates/student-cv-europass/appearance";
import type { DocumentFormProps, CvContent } from "../../documents.types";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => ({
  value: l,
  label: l,
}));

const EMPTY_EDUCATION = {
  institution: "",
  degree: "",
  field_of_study: "",
  start_period: "",
  end_period: "",
  gpa: "",
};
const EMPTY_EXPERIENCE = {
  company: "",
  role: "",
  start_period: "",
  end_period: "",
  description: "",
};
const EMPTY_LANGUAGE = {
  language: "",
  listening: "",
  reading: "",
  spoken_production: "",
  spoken_interaction: "",
  writing: "",
};

export function CvEuropassForm({
  initialContent,
  onSubmit,
  isLoading,
}: DocumentFormProps) {
  const initial = (initialContent ?? {}) as CvContent;

  const form = useForm({
    initialValues: {
      date_of_birth: initial.date_of_birth ?? "",
      place_of_birth: initial.place_of_birth ?? "",
      gender: initial.gender ?? "",
      nationality: initial.nationality ?? "Nepali",
      current_address: initial.current_address ?? "",
      passport_number: initial.passport_number ?? "",
      image: initial.image ?? "",
      summary: initial.summary ?? "",
      skills: initial.skills ?? "",
      mother_tongue: initial.mother_tongue ?? "",
      educations: initial.educations ?? [],
      experiences: initial.experiences ?? [],
      languages: initial.languages ?? [],
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    // Spread `initial` so appearance (set via the Customizations panel) and any other
    // fields not on this form survive the wholesale content replacement.
    const content: CvContent = {
      ...initial,
      ...values,
      appearance: initial.appearance ?? DEFAULT_EUROPASS_APPEARANCE,
    };
    onSubmit(content);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md" p="md">
        <Text fw={600} size="sm">
          Personal Details
        </Text>
        <Group grow align="flex-start">
          <TextInput
            label="Date of birth"
            placeholder="DD/MM/YYYY"
            {...form.getInputProps("date_of_birth")}
            disabled={isLoading}
          />
          <TextInput
            label="Place of birth"
            {...form.getInputProps("place_of_birth")}
            disabled={isLoading}
          />
        </Group>
        <Group grow align="flex-start">
          <TextInput
            label="Gender"
            {...form.getInputProps("gender")}
            disabled={isLoading}
          />
          <TextInput
            label="Nationality"
            {...form.getInputProps("nationality")}
            disabled={isLoading}
          />
        </Group>
        <TextInput
          label="Address"
          {...form.getInputProps("current_address")}
          disabled={isLoading}
        />
        <Group grow align="flex-start">
          <TextInput
            label="Passport number"
            {...form.getInputProps("passport_number")}
            disabled={isLoading}
          />
          <TextInput
            label="Photo URL"
            placeholder="https://…"
            {...form.getInputProps("image")}
            disabled={isLoading}
          />
        </Group>

        <Divider />
        <Text fw={600} size="sm">
          About Myself
        </Text>
        <Textarea
          label="Summary"
          autosize
          minRows={3}
          {...form.getInputProps("summary")}
          disabled={isLoading}
        />

        <Divider />
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">
            Education & Training
          </Text>
          <Button
            variant="light"
            size="xs"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={() =>
              form.insertListItem("educations", { ...EMPTY_EDUCATION })
            }
            disabled={isLoading}
          >
            Add
          </Button>
        </Group>
        {form.values.educations.map((_, i) => (
          <Stack key={i} gap="xs">
            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                Entry {i + 1}
              </Text>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => form.removeListItem("educations", i)}
                disabled={isLoading}
                aria-label={`Remove education entry ${i + 1}`}
              >
                <TrashIcon size={14} />
              </ActionIcon>
            </Group>
            <Group grow align="flex-start">
              <TextInput
                label="Qualification"
                {...form.getInputProps(`educations.${i}.degree`)}
                disabled={isLoading}
              />
              <TextInput
                label="Institution"
                {...form.getInputProps(`educations.${i}.institution`)}
                disabled={isLoading}
              />
            </Group>
            <Group grow align="flex-start">
              <TextInput
                label="Start"
                {...form.getInputProps(`educations.${i}.start_period`)}
                disabled={isLoading}
              />
              <TextInput
                label="End"
                {...form.getInputProps(`educations.${i}.end_period`)}
                disabled={isLoading}
              />
              <TextInput
                label="Location / field"
                {...form.getInputProps(`educations.${i}.field_of_study`)}
                disabled={isLoading}
              />
            </Group>
          </Stack>
        ))}

        <Divider />
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">
            Work Experience
          </Text>
          <Button
            variant="light"
            size="xs"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={() =>
              form.insertListItem("experiences", { ...EMPTY_EXPERIENCE })
            }
            disabled={isLoading}
          >
            Add
          </Button>
        </Group>
        {form.values.experiences.map((_, i) => (
          <Stack key={i} gap="xs">
            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                Entry {i + 1}
              </Text>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => form.removeListItem("experiences", i)}
                disabled={isLoading}
                aria-label={`Remove work experience entry ${i + 1}`}
              >
                <TrashIcon size={14} />
              </ActionIcon>
            </Group>
            <Group grow align="flex-start">
              <TextInput
                label="Role"
                {...form.getInputProps(`experiences.${i}.role`)}
                disabled={isLoading}
              />
              <TextInput
                label="Organization"
                {...form.getInputProps(`experiences.${i}.company`)}
                disabled={isLoading}
              />
            </Group>
            <Group grow align="flex-start">
              <TextInput
                label="Start"
                {...form.getInputProps(`experiences.${i}.start_period`)}
                disabled={isLoading}
              />
              <TextInput
                label="End (blank = CURRENT)"
                {...form.getInputProps(`experiences.${i}.end_period`)}
                disabled={isLoading}
              />
            </Group>
            <Textarea
              label="Responsibilities (one per line)"
              autosize
              minRows={2}
              {...form.getInputProps(`experiences.${i}.description`)}
              disabled={isLoading}
            />
          </Stack>
        ))}

        <Divider />
        <Text fw={600} size="sm">
          Skills
        </Text>
        <Textarea
          label="Skills (one per line, or pipe-separated)"
          autosize
          minRows={2}
          {...form.getInputProps("skills")}
          disabled={isLoading}
        />

        <Divider />
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">
            Language Skills
          </Text>
          <Button
            variant="light"
            size="xs"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={() =>
              form.insertListItem("languages", { ...EMPTY_LANGUAGE })
            }
            disabled={isLoading}
          >
            Add language
          </Button>
        </Group>
        <TextInput
          label="Mother tongue(s)"
          {...form.getInputProps("mother_tongue")}
          disabled={isLoading}
        />
        {form.values.languages.map((_, i) => (
          <Stack key={i} gap="xs">
            <Group justify="space-between" align="center">
              <TextInput
                label="Language"
                style={{ flex: 1 }}
                {...form.getInputProps(`languages.${i}.language`)}
                disabled={isLoading}
              />
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                mt={22}
                onClick={() => form.removeListItem("languages", i)}
                disabled={isLoading}
                aria-label={`Remove language ${i + 1}`}
              >
                <TrashIcon size={14} />
              </ActionIcon>
            </Group>
            <Group grow align="flex-start">
              <Select
                label="Listening"
                data={CEFR_LEVELS}
                clearable
                {...form.getInputProps(`languages.${i}.listening`)}
                disabled={isLoading}
              />
              <Select
                label="Reading"
                data={CEFR_LEVELS}
                clearable
                {...form.getInputProps(`languages.${i}.reading`)}
                disabled={isLoading}
              />
              <Select
                label="Spoken production"
                data={CEFR_LEVELS}
                clearable
                {...form.getInputProps(`languages.${i}.spoken_production`)}
                disabled={isLoading}
              />
              <Select
                label="Spoken interaction"
                data={CEFR_LEVELS}
                clearable
                {...form.getInputProps(`languages.${i}.spoken_interaction`)}
                disabled={isLoading}
              />
              <Select
                label="Writing"
                data={CEFR_LEVELS}
                clearable
                {...form.getInputProps(`languages.${i}.writing`)}
                disabled={isLoading}
              />
            </Group>
          </Stack>
        ))}

        <Button type="submit" loading={isLoading} fullWidth mt="sm">
          Save Europass CV
        </Button>
      </Stack>
    </form>
  );
}

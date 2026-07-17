"use client";

import {
  Alert,
  Button,
  Center,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";

import { StudentCard } from "../StudentCard";
import type { StudentSearchViewProps } from "../../NewDocumentModal.types";

/** Fixed viewport for the results so selecting a card never resizes the modal. */
const RESULTS_HEIGHT = 320;

/**
 * Search screen of the New Document modal — the "which student is this document
 * for?" question. A search box drives a live-filtered list of student cards; the
 * output contract's loading / failed / empty states each resolve inside the
 * scroll region, and the empty state offers the create-a-new-student escape hatch.
 */
export function StudentSearchView({
  search,
  onSearchChange,
  students,
  isLoading,
  isError,
  onRetry,
  selectedId,
  onSelect,
  onCreateNew,
}: StudentSearchViewProps) {
  const trimmed = search.trim();

  return (
    <Stack gap="sm">
      <TextInput
        placeholder="Search students by name, code, email, or phone"
        leftSection={<MagnifyingGlassIcon size={16} />}
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        aria-label="Search students"
        autoFocus
      />

      <ScrollArea.Autosize mah={RESULTS_HEIGHT} type="auto" offsetScrollbars>
        {isError ? (
          <Alert
            variant="light"
            color="red"
            icon={<WarningIcon size={16} />}
            title="Couldn't load students"
          >
            <Group justify="space-between" align="center">
              <Text size="sm">Please try again.</Text>
              <Button size="xs" variant="light" onClick={onRetry}>
                Retry
              </Button>
            </Group>
          </Alert>
        ) : isLoading ? (
          <Stack gap="xs" role="status" aria-label="Loading students">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={58} radius="md" />
            ))}
          </Stack>
        ) : students.length === 0 ? (
          <Center mih={RESULTS_HEIGHT}>
            <Stack gap="sm" align="center" px="md" ta="center">
              <Text size="sm" c="dimmed">
                {trimmed
                  ? `No students match "${trimmed}".`
                  : "No students yet."}
              </Text>
              <Text size="xs" c="dimmed">
                Can&apos;t find that student?
              </Text>
              <Button
                size="sm"
                variant="light"
                leftSection={<UserPlusIcon size={16} />}
                onClick={onCreateNew}
              >
                Create a new student
              </Button>
            </Stack>
          </Center>
        ) : (
          <Stack gap="xs" role="group" aria-label="Students">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                selected={student.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </Stack>
        )}
      </ScrollArea.Autosize>

      {!isError && !isLoading && students.length > 0 && (
        <Group justify="center" gap={6}>
          <Text size="xs" c="dimmed">
            Not the right person?
          </Text>
          <Button
            size="compact-xs"
            variant="subtle"
            leftSection={<UserPlusIcon size={13} />}
            onClick={onCreateNew}
          >
            Create a new student
          </Button>
        </Group>
      )}
    </Stack>
  );
}

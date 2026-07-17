"use client";

import {
  Badge,
  Button,
  Group,
  Modal,
  Stack,
  Table,
  Text,
} from "@peppermint/ui";

import type { DuplicateMatch } from "../../../../_shared";

interface DuplicateWarningModalProps {
  matches: DuplicateMatch[] | null;
  onClose: () => void;
}

/**
 * Shown after a create that the backend flagged as a possible duplicate (§11.2). The
 * applicant was still created — this is a non-blocking heads-up with masked matches so
 * the user can review and merge later if it really is a duplicate.
 */
export function DuplicateWarningModal({
  matches,
  onClose,
}: DuplicateWarningModalProps) {
  const opened = matches !== null && matches.length > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Possible duplicate"
      centered
      styles={{ body: { padding: "var(--mantine-spacing-md)" } }}
    >
      <Stack gap="sm">
        <Text size="sm">
          The applicant was created, but these existing records look similar.
          Review them and merge later if this is a duplicate.
        </Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Applicant</Table.Th>
              <Table.Th>Matches</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(matches ?? []).map((m) => (
              <Table.Tr key={m.applicant_code}>
                <Table.Td>
                  <Text size="xs" fw={500}>
                    {m.display_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {m.applicant_code}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {m.email_match && (
                      <Badge size="xs" variant="light" color="orange">
                        Email
                      </Badge>
                    )}
                    {m.phone_match && (
                      <Badge size="xs" variant="light" color="orange">
                        Phone
                      </Badge>
                    )}
                    {m.identity_match && (
                      <Badge size="xs" variant="light" color="red">
                        Identity
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Group justify="flex-end">
          <Button onClick={onClose}>Got it</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

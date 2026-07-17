"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Group, Modal, Stack, Text } from "@peppermint/ui";

import { CreateStudentView, StudentSearchView } from "./components";
import { useStudentSearch } from "./NewDocumentModal.hooks";
import type {
  NewDocumentModalProps,
  NewDocumentView,
} from "./NewDocumentModal.types";

/**
 * Applicant picker for starting a document workspace. Documents are authored per
 * student, so "new" means "choose a student, then open their full-screen editor".
 * The modal has two screens: a live search of student cards, and — when the search
 * comes up empty — an inline create-student form that routes straight into the new
 * student's workspace on success.
 */
export function NewDocumentModal({ opened, onClose }: NewDocumentModalProps) {
  const router = useRouter();
  const [view, setView] = useState<NewDocumentView>("search");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { students, isLoading, isError, refetch } = useStudentSearch(
    search,
    opened,
  );

  // Only allow continuing when the pick is still one of the visible results —
  // guards against a selection left over from a since-changed/refetched list.
  const canContinue = !!selectedId && students.some((s) => s.id === selectedId);

  // A new search invalidates the previous pick (they're looking for someone else).
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSelectedId(null);
  };

  const resetState = () => {
    setView("search");
    setSearch("");
    setSelectedId(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const openWorkspace = (studentId: string) => {
    resetState();
    router.push(`/documents/${studentId}`);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="New document"
      size="lg"
      centered
      styles={{ body: { padding: "var(--mantine-spacing-md)" } }}
    >
      {view === "search" ? (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Find the student this document is for.
          </Text>

          <StudentSearchView
            search={search}
            onSearchChange={handleSearchChange}
            students={students}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            selectedId={selectedId}
            onSelect={(student) => setSelectedId(student.id)}
            onCreateNew={() => setView("create")}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              disabled={!canContinue}
              onClick={() => {
                if (canContinue && selectedId) openWorkspace(selectedId);
              }}
            >
              Open workspace
            </Button>
          </Group>
        </Stack>
      ) : (
        <CreateStudentView
          initialName={search}
          onBack={() => setView("search")}
          onCreated={openWorkspace}
        />
      )}
    </Modal>
  );
}

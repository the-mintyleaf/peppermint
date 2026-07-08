"use client";

import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import {
  Badge,
  Button,
  Group,
  Paper,
  Text,
  useQueryClient,
} from "@peppermint/ui";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { FlaskIcon } from "@phosphor-icons/react/dist/csr/Flask";

import { StructureDataProvider } from "../_shared/structure-data";
import { StructureCanvas } from "../structure";
import { createMockStructureDataSource } from "./mockStructureDataSource";
import { TEST_ORG_ID } from "./testSeed";

/**
 * Offline playground for the Structure Builder. Renders the exact same
 * `StructureCanvas` the real builder uses, but wrapped in a `StructureDataProvider`
 * backed by an in-memory mock — so UI work here carries straight over to the real
 * builder, and vice versa. No backend, no auth: reset re-seeds the tree in place.
 */
export function TestTree() {
  const queryClient = useQueryClient();
  const [mock] = useState(() => createMockStructureDataSource());
  // Bumping this remounts the canvas so its init effects (claim org, auto-expand)
  // re-run against the freshly re-seeded mock.
  const [resetKey, setResetKey] = useState(0);

  function handleReset() {
    mock.reset();
    queryClient.removeQueries({
      predicate: (query) => {
        const key = query.queryKey;
        if (!Array.isArray(key)) return false;
        return (
          (key[0] === "organizations" && key[1] === TEST_ORG_ID) ||
          key[0] === "units"
        );
      },
    });
    setResetKey((k) => k + 1);
  }

  return (
    <StructureDataProvider orgId={TEST_ORG_ID} dataSource={mock.dataSource}>
      <ReactFlowProvider>
        <Paper
          withBorder
          radius="xl"
          px="md"
          py={6}
          shadow="sm"
          style={{
            position: "fixed",
            top: 78,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
          }}
        >
          <Group gap="sm" wrap="nowrap">
            <Badge
              variant="light"
              color="grape"
              leftSection={<FlaskIcon size={12} weight="fill" />}
            >
              Test playground
            </Badge>
            <Text size="xs" c="dimmed">
              In-memory only — no backend. Changes reset on reload.
            </Text>
            <Button
              size="compact-xs"
              variant="subtle"
              leftSection={<ArrowClockwiseIcon size={13} />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Group>
        </Paper>
        <StructureCanvas key={resetKey} />
      </ReactFlowProvider>
    </StructureDataProvider>
  );
}

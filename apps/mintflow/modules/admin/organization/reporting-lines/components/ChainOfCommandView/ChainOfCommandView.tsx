"use client";

import {
  Divider,
  Drawer,
  List,
  Stack,
  Text,
  Title,
  useQuery,
} from "@peppermint/ui";

import { BilingualName } from "../../../_shared/components/BilingualName";
import {
  fetchChainOfCommand,
  fetchSubordinates,
} from "../../reportingLines.api";
import { reportingLinesQueryKeys } from "../../reportingLines.queryKeys";
import type { ChainOfCommandViewProps } from "./ChainOfCommandView.types";

export function ChainOfCommandView({
  positionId,
  opened,
  onClose,
}: ChainOfCommandViewProps) {
  const { data: chain } = useQuery({
    queryKey: reportingLinesQueryKeys.chainOfCommand(
      positionId ?? "",
      "administrative",
    ),
    queryFn: () => fetchChainOfCommand(positionId as string),
    enabled: Boolean(positionId),
  });

  const { data: subordinates } = useQuery({
    queryKey: reportingLinesQueryKeys.subordinates(positionId ?? ""),
    queryFn: () => fetchSubordinates(positionId as string),
    enabled: Boolean(positionId),
  });

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      title="Chain of Command"
      size="sm"
    >
      <Stack gap="md">
        <div>
          <Title order={5} mb={4}>
            Reports up to
          </Title>
          {!chain?.length ? (
            <Text size="sm" c="dimmed">
              No administrative chain above this position.
            </Text>
          ) : (
            <List size="sm" type="ordered">
              {chain.map((link) => (
                <List.Item key={link.position_id}>
                  <BilingualName np={link.title_np} en={link.title_en} inline />{" "}
                  ({link.code})
                </List.Item>
              ))}
            </List>
          )}
        </div>

        <Divider />

        <div>
          <Title order={5} mb={4}>
            Direct subordinates
          </Title>
          {!subordinates?.length ? (
            <Text size="sm" c="dimmed">
              No positions report to this one.
            </Text>
          ) : (
            <List size="sm">
              {subordinates.map((sub) => (
                <List.Item key={sub.id}>
                  <BilingualName np={sub.title_np} en={sub.title_en} inline /> (
                  {sub.code})
                </List.Item>
              ))}
            </List>
          )}
        </div>
      </Stack>
    </Drawer>
  );
}

"use client";

import {
  Badge,
  Button,
  Center,
  Divider,
  Group,
  List,
  Loader,
  Paper,
  Stack,
  Text,
  useForm,
} from "@peppermint/ui";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import { PermissionKeyPicker } from "@/modules/admin/authenticate/_shared/PermissionKeyPicker";
import { ScopeFields } from "@/modules/admin/authenticate/_shared/ScopeFields";
import { UserPicker } from "@/modules/admin/authenticate/_shared/UserPicker";
import type { ScopeValue } from "@/modules/admin/authenticate/_shared/authenticate.types";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { AccessCheckRequest, AccessDecision } from "../access-tools.types";
import {
  useAccessTester,
  type AccessTesterAction,
} from "./AccessTesterPanel.hooks";

interface AccessTesterFormValues {
  subjectUserId: string | null;
  permissionKey: string | null;
  scope: ScopeValue;
}

const RISK_COLOR: Record<AccessDecision["risk_level"], string> = {
  low: "gray",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

function toPayload(values: AccessTesterFormValues): AccessCheckRequest | null {
  if (!values.subjectUserId || !values.permissionKey) return null;
  return {
    permission_key: values.permissionKey,
    subject_user_id: values.subjectUserId,
    organization_id: values.scope.organization,
    organization_unit_id: values.scope.organization_unit,
  };
}

function fieldError(error: unknown): string | undefined {
  return typeof error === "string" ? error : undefined;
}

interface AccessTesterFormProps {
  defaultUserId: string;
}

function AccessTesterForm({ defaultUserId }: AccessTesterFormProps) {
  const { runCheck, runExplain, isChecking, isExplaining, result, lastAction } =
    useAccessTester();

  const form = useForm<AccessTesterFormValues>({
    initialValues: {
      subjectUserId: defaultUserId,
      permissionKey: null,
      scope: {
        scope_type: "global",
        organization: null,
        organization_unit: null,
      },
    },
    validate: {
      subjectUserId: (value) => (!value ? "Required" : null),
      permissionKey: (value) => (!value ? "Required" : null),
    },
  });

  const isBusy = isChecking || isExplaining;

  const submit = (action: AccessTesterAction) => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    const payload = toPayload(form.values);
    if (!payload) return;

    if (action === "check") {
      runCheck(payload);
    } else {
      runExplain(payload);
    }
  };

  return (
    <Stack gap="lg" p="md">
      <Stack gap="md" maw={480}>
        <UserPicker
          label="Subject user"
          required
          disabled={isBusy}
          value={form.values.subjectUserId}
          onChange={(userId) => form.setFieldValue("subjectUserId", userId)}
          error={fieldError(form.errors.subjectUserId)}
        />
        <PermissionKeyPicker
          required
          disabled={isBusy}
          value={form.values.permissionKey}
          onChange={(key) => form.setFieldValue("permissionKey", key)}
          error={fieldError(form.errors.permissionKey)}
        />
        <ScopeFields
          disabled={isBusy}
          value={form.values.scope}
          onChange={(scope) => form.setFieldValue("scope", scope)}
        />

        <Group gap="sm">
          <Button
            leftSection={<MagnifyingGlassIcon size={16} aria-label="Check" />}
            loading={isChecking}
            disabled={isExplaining}
            onClick={() => submit("check")}
          >
            Check
          </Button>
          <Button
            variant="light"
            loading={isExplaining}
            disabled={isChecking}
            onClick={() => submit("explain")}
          >
            Explain
          </Button>
        </Group>
      </Stack>

      {result && <AccessResultPanel result={result} action={lastAction} />}
    </Stack>
  );
}

interface AccessResultPanelProps {
  result: AccessDecision;
  action: AccessTesterAction | null;
}

function AccessResultPanel({ result, action }: AccessResultPanelProps) {
  const isAllowed = result.decision === "allow";

  return (
    <Paper withBorder radius="sm" p="md" maw={720}>
      <Stack gap="sm">
        <Group justify="space-between" wrap="wrap">
          <Group gap="xs">
            <Badge
              size="lg"
              color={isAllowed ? "green" : "red"}
              leftSection={
                isAllowed ? (
                  <CheckCircleIcon size={14} aria-label="Allowed" />
                ) : (
                  <XCircleIcon size={14} aria-label="Denied" />
                )
              }
            >
              {isAllowed ? "Allow" : "Deny"}
            </Badge>
            <Text size="xs" c="dimmed">
              {action === "explain" ? "Explained" : "Checked"} ·{" "}
              {result.permission_key}
            </Text>
          </Group>
          <Group gap={4}>
            <Badge size="xs" color={RISK_COLOR[result.risk_level]}>
              {result.risk_level}
            </Badge>
            {result.requires_audit && (
              <Badge size="xs" color="grape" variant="outline">
                Requires audit
              </Badge>
            )}
          </Group>
        </Group>

        <Text size="sm">{result.reason}</Text>

        <Divider />

        <Group grow align="flex-start">
          <MatchedList
            title="Role bindings"
            items={result.matched_role_bindings}
          />
          <MatchedList title="Grants" items={result.matched_grants} />
          <MatchedList title="Denials" items={result.matched_denials} />
        </Group>
      </Stack>
    </Paper>
  );
}

interface MatchedListProps {
  title: string;
  items: string[];
}

function MatchedList({ title, items }: MatchedListProps) {
  return (
    <Stack gap={4}>
      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
        {title}
      </Text>
      {items.length === 0 ? (
        <Text size="xs" c="dimmed">
          None
        </Text>
      ) : (
        <List size="xs" spacing={2}>
          {items.map((id) => (
            <List.Item key={id}>
              <Text size="xs" ff="monospace">
                {id}
              </Text>
            </List.Item>
          ))}
        </List>
      )}
    </Stack>
  );
}

export function AccessTesterPanel() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return (
      <Center h={240}>
        <Loader size="sm" />
      </Center>
    );
  }

  return <AccessTesterForm key={user.id} defaultUserId={user.id} />;
}

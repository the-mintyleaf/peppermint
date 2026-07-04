import { useState } from "react";
import { notifications, useMutation } from "@peppermint/ui";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { checkAccess, explainAccess } from "../access-tools.api";
import type { AccessCheckRequest, AccessDecision } from "../access-tools.types";

export type AccessTesterAction = "check" | "explain";

export function useAccessTester() {
  const [result, setResult] = useState<AccessDecision | null>(null);
  const [lastAction, setLastAction] = useState<AccessTesterAction | null>(null);

  const checkMutation = useMutation({
    mutationFn: (payload: AccessCheckRequest) => checkAccess(payload),
    onSuccess: (data) => {
      setResult(data);
      setLastAction("check");
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't check access",
        message: getApiErrorMessage(error),
      });
    },
  });

  const explainMutation = useMutation({
    mutationFn: (payload: AccessCheckRequest) => explainAccess(payload),
    onSuccess: (data) => {
      setResult(data);
      setLastAction("explain");
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't explain access",
        message: getApiErrorMessage(error),
      });
    },
  });

  return {
    runCheck: checkMutation.mutate,
    runExplain: explainMutation.mutate,
    isChecking: checkMutation.isPending,
    isExplaining: explainMutation.isPending,
    result,
    lastAction,
  };
}

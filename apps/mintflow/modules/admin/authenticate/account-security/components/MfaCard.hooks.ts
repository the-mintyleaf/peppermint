"use client";

import { useState } from "react";
import { modals, notifications, useMutation } from "@peppermint/ui";
import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";
import {
  confirmMfa,
  disableMfa,
  regenerateRecoveryCodes,
  setupMfa,
} from "../account-security.api";
import type { MfaSetupResponse } from "../account-security.types";

export type MfaScreen = "idle" | "setup" | "confirm";

export type MfaStatus = "unknown" | "enrolled" | "disabled";

interface RecoveryModalState {
  opened: boolean;
  codes: string[];
}

export function useMfaCard() {
  const [screen, setScreen] = useState<MfaScreen>("idle");
  const [status, setStatus] = useState<MfaStatus>("unknown");
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [recoveryModal, setRecoveryModal] = useState<RecoveryModalState>({
    opened: false,
    codes: [],
  });

  const openRecoveryModal = (codes: string[]) =>
    setRecoveryModal({ opened: true, codes });
  const closeRecoveryModal = () =>
    setRecoveryModal({ opened: false, codes: [] });

  const setupMutation = useMutation({
    mutationFn: setupMfa,
    onSuccess: (data) => {
      setSetupData(data);
      setCode("");
      setScreen("setup");
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't start MFA setup",
        message: getApiErrorMessage(error),
      });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (value: string) => confirmMfa(value),
    onSuccess: (data) => {
      setStatus("enrolled");
      setScreen("idle");
      setSetupData(null);
      setCode("");
      openRecoveryModal(data.recovery_codes);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      if (apiError.code === "AUTH_MFA_NOT_ENROLLED") {
        // No pending setup on the server — restart the flow from the beginning.
        setScreen("idle");
        setSetupData(null);
        setCode("");
        notifications.show({
          color: "red",
          title: "Setup expired",
          message: "Your MFA setup expired. Please start again.",
        });
        return;
      }
      // AUTH_MFA_INVALID_CODE and anything else: keep the user on the confirm
      // screen so they can retry with a fresh code.
      notifications.show({
        color: "red",
        title: "Couldn't confirm code",
        message: getApiErrorMessage(error),
      });
    },
  });

  const disableMutation = useMutation({
    mutationFn: disableMfa,
    onSuccess: () => {
      setStatus("disabled");
      notifications.show({
        color: "green",
        title: "MFA disabled",
        message: "Two-factor authentication has been turned off.",
      });
    },
    onError: (error) => {
      const apiError = getApiError(error);
      if (apiError.code === "AUTH_MFA_DISABLE_BLOCKED_BY_POLICY") {
        notifications.show({
          color: "red",
          title: "MFA can't be disabled",
          message:
            "MFA is required by policy on this account. Contact an administrator to have it reset — there is no self-service option.",
          autoClose: false,
        });
        return;
      }
      notifications.show({
        color: "red",
        title: "Couldn't disable MFA",
        message: getApiErrorMessage(error),
      });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: regenerateRecoveryCodes,
    onSuccess: (data) => {
      openRecoveryModal(data.recovery_codes);
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't regenerate recovery codes",
        message: getApiErrorMessage(error),
      });
    },
  });

  const startSetup = () => setupMutation.mutate();

  const goToConfirm = () => setScreen("confirm");

  const cancelSetup = () => {
    setScreen("idle");
    setSetupData(null);
    setCode("");
  };

  const confirmSetup = () => {
    if (!code.trim()) return;
    confirmMutation.mutate(code.trim());
  };

  const requestDisable = () =>
    modals.openConfirmModal({
      title: "Disable MFA",
      children:
        "This removes two-factor authentication from your account, making it less secure. Continue?",
      labels: { confirm: "Disable MFA", cancel: "Keep MFA on" },
      confirmProps: { color: "red" },
      onConfirm: () => disableMutation.mutate(),
    });

  const requestRegenerate = () =>
    modals.openConfirmModal({
      title: "Regenerate recovery codes",
      children:
        "Generating new recovery codes immediately invalidates all of your existing codes. Continue?",
      labels: { confirm: "Regenerate codes", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => regenerateMutation.mutate(),
    });

  return {
    screen,
    status,
    setupData,
    code,
    setCode,
    recoveryModal,
    closeRecoveryModal,
    startSetup,
    goToConfirm,
    cancelSetup,
    confirmSetup,
    requestDisable,
    requestRegenerate,
    isStartingSetup: setupMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isDisabling: disableMutation.isPending,
    isRegenerating: regenerateMutation.isPending,
  };
}

"use client";

import { Component } from "react";
import type { ReactNode } from "react";
import { Button, Center, Stack, Text } from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";

export interface ModuleErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Side-effect on catch (e.g. report to telemetry). */
  onError?: (error: Error) => void;
  /** Heading shown by the default fallback. */
  title?: string;
  /**
   * When any value here changes (shallow), the boundary clears its error — so
   * navigating to a different record or changing a filter recovers automatically
   * instead of staying stuck on the fallback. Pass e.g. `[recordId]` or `[pathname]`.
   */
  resetKeys?: readonly unknown[];
}

interface ModuleErrorBoundaryState {
  error: Error | null;
}

/**
 * Module-level React error boundary (CLAUDE.md mandates boundaries at the module
 * level, not the app root). Wrap a module's content so a render/runtime error
 * shows a recoverable fallback instead of blanking the whole app.
 */
export class ModuleErrorBoundary extends Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  state: ModuleErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    this.props.onError?.(error);
  }

  componentDidUpdate(prev: ModuleErrorBoundaryProps): void {
    if (!this.state.error) return;
    const a = prev.resetKeys;
    const b = this.props.resetKeys;
    const changed =
      a?.length !== b?.length || !!a?.some((value, i) => value !== b?.[i]);
    if (changed) this.reset();
  }

  reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <Center p="xl" mih={240}>
        <Stack align="center" gap="xs" maw={420}>
          <WarningIcon
            size={40}
            weight="duotone"
            color="var(--mantine-color-red-6)"
            aria-hidden
          />
          <Text size="sm" fw={600} ta="center">
            {this.props.title ?? "Something went wrong"}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            This section failed to load. You can try again.
          </Text>
          <Button size="xs" variant="light" onClick={this.reset} mt="xs">
            Try again
          </Button>
        </Stack>
      </Center>
    );
  }
}

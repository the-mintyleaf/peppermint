import type { ReactNode } from 'react';

export type Step = { label: string; description?: string };

export type StepJumpMode = 'always' | 'completed-only' | 'never';

export interface FormShellProps {
  title: string;
  description?: string;
  onBack: () => void;
  steps?: (string | Step)[];
  disabledSteps?: number[];
  showStepper?: boolean;
  showDirtyBanner?: boolean;
  allowStepJump?: StepJumpMode;
  onStepBack?: () => void;
  onStepNext?: () => void;
  onCancel?: () => void;
  iconActive?: ReactNode;
  iconComplete?: ReactNode;
  iconIncomplete?: ReactNode;
  children: ReactNode;
}

export interface FormShellHeaderProps {
  title: string;
  description?: string;
  onBack: () => void;
}

export interface FormShellStepperProps {
  steps: (string | Step)[];
  disabledSteps?: number[];
  allowStepJump?: StepJumpMode;
  iconActive?: ReactNode;
  iconComplete?: ReactNode;
  iconIncomplete?: ReactNode;
}

export interface FormShellFooterProps {
  steps: (string | Step)[];
  onStepBack?: () => void;
  onStepNext?: () => void;
  onCancel?: () => void;
}

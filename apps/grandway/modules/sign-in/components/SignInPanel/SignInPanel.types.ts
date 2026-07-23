export type SignInPhase = "credentials" | "mfa" | "redirecting";

export interface SignInPanelProps {
  phase: SignInPhase;
  onPhaseChange: (phase: SignInPhase) => void;
}

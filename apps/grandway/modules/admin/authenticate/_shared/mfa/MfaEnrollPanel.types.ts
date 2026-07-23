export interface MfaEnrollPanelProps {
  /** Called once `mfa/verify/` succeeds and MFA is active. */
  onVerified: () => void;
  /** Label for the initial "start enrollment" button. Defaults to "Set up authenticator app". */
  startLabel?: string;
}

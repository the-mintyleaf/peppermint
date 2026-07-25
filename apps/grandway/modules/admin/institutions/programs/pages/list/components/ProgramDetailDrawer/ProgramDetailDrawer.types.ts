export interface ProgramDetailDrawerProps {
  /** The program to show; null keeps the drawer closed. */
  programId: string | null;
  opened: boolean;
  onClose: () => void;
}

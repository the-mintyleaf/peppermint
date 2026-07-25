export interface ClientDetailDrawerProps {
  /** The client to show, or `null` when the drawer is closed. */
  clientId: string | null;
  opened: boolean;
  onClose: () => void;
}

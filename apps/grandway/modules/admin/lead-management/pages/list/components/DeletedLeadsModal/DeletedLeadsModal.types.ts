export interface DeletedLeadsModalProps {
  opened: boolean;
  onClose: () => void;
  /** Open a deleted lead's drawer (its reason and Restore live there too). */
  onViewLead: (leadId: string) => void;
}

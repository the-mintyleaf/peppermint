export interface EvidencePickerModalProps {
  applicantId: string;
  opened: boolean;
  onClose: () => void;
  onSelect: (fileId: string) => void;
}

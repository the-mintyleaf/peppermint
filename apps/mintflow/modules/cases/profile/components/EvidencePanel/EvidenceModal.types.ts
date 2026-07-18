export interface EvidenceModalProps {
  workId: string;
  opened: boolean;
  onClose: () => void;
}

// Form-value type satisfies the FormWrapper Record<string, unknown> contract.
export interface EvidenceFormValues extends Record<string, unknown> {
  evidence_type: string;
  title: string;
  text_payload: string;
  external_reference: string;
  purpose: string;
}

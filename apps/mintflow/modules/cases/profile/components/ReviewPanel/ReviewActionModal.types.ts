export type ReviewAction = "decide" | "comment";

export interface ReviewActionModalProps {
  workId: string;
  action: ReviewAction | null;
  reviewId: string | null;
  onClose: () => void;
}

// Form-value types satisfy the FormWrapper Record<string, unknown> contract.
export interface DecideValues extends Record<string, unknown> {
  decision: string;
  decision_remarks: string;
}
export interface CommentValues extends Record<string, unknown> {
  comment_type: string;
  body: string;
}

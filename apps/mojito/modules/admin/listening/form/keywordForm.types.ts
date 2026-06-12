import type { KeywordRow } from "../keywords.types";

export interface KeywordFormProps {
  initialValues?: Partial<KeywordRow>;
  onSubmit: (values: KeywordRow) => void;
  isLoading?: boolean;
}

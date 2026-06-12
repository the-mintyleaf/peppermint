import type { CompetitorRow } from "../competitors.types";

export interface CompetitorFormProps {
  initialValues?: Partial<CompetitorRow>;
  onSubmit: (values: CompetitorRow) => void;
  isLoading?: boolean;
}

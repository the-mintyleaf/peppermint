import type { Delegation } from "../delegations.types";

export interface DelegationsFormProps {
  initialValues?: Partial<Delegation>;
  onSubmit: (values: Delegation) => void;
  isLoading?: boolean;
}

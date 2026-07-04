import type { ScopeValue } from "../authenticate.types";

export interface ScopeFieldsProps {
  value: ScopeValue;
  onChange: (value: ScopeValue) => void;
  disabled?: boolean;
  error?: string;
}

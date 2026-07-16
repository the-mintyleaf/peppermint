export interface ReasonTextareaProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  description?: string;
  error?: string;
}

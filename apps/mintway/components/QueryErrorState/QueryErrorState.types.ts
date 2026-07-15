export interface QueryErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export interface DocumentUnavailableProps {
  /** User-facing copy, resolved from the API error code via `getApiErrorMessage`. */
  message: string;
  /** Retry the failed load. Omitted when the failure isn't retryable. */
  onRetry?: () => void;
}

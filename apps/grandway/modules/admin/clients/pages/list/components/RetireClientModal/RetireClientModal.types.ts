export interface OpenRetireClientModalOptions {
  /** Organization name, shown in the confirmation copy. */
  clientName: string;
  /** Runs on confirm with the entered reason; may be async. Modal closes when it resolves. */
  onConfirm: (reason: string) => void | Promise<void>;
}

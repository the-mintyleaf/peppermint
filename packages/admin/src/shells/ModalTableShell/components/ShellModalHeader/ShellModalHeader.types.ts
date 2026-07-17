export interface ShellModalHeaderProps {
  /** Optional breadcrumb parent. When omitted, only `currentLabel` is shown. */
  parentLabel?: string;
  currentLabel: string;
  onClose: () => void;
}

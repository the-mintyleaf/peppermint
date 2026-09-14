export interface TemplateDrawerProps {
  /** The template to show, or `null` when the drawer is closed. */
  templateId: string | null;
  opened: boolean;
  onClose: () => void;
}

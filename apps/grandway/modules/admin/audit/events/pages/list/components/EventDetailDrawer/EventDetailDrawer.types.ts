import type { AuditEvent } from "@/modules/admin/audit/_shared/audit.types";

export interface EventDetailDrawerProps {
  event: AuditEvent | null;
  opened: boolean;
  onClose: () => void;
}

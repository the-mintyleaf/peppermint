import type { ClientRow } from "../../../../clients.types";

export interface ClientRowActionsMenuProps {
  client: ClientRow;
  onViewDetails: (client: ClientRow) => void;
}

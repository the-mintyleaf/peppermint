"use client";

import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import type { Offer } from "../../../../offers.types";
import type { OfferRowActionsMenuProps } from "./OfferRowActionsMenu.types";

/**
 * "View" navigates to the Offer Detail route (where issue / decide / condition
 * controls live). "Edit" delegates to the shell's own edit modal — same pattern
 * as `JourneyRowActionsMenu`. Edit is offered on every offer regardless of
 * status: a PATCH only touches mutable wording/money fields, never the
 * lifecycle, so the backend permits it in any state.
 */
export function OfferRowActionsMenu({
  offer,
  onViewDetails,
}: OfferRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<Offer>();

  return (
    <RowActionsMenu<Offer>
      record={offer}
      aria-label={`Actions for the offer to ${offer.applicant_name}`}
      actions={[
        {
          label: "View",
          icon: <EyeIcon size={16} aria-hidden />,
          onClick: onViewDetails,
        },
        {
          label: "Edit",
          icon: <PencilSimpleIcon size={16} aria-hidden />,
          onClick: (record) => openEditModal(record),
        },
      ]}
    />
  );
}

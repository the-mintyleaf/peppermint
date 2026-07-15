"use client";

import { createChildResource } from "../../_shared";
import type { Interaction } from "../../_shared";
import { InteractionForm } from "./InteractionForm";
import type { InteractionPayload } from "./InteractionForm.types";
import { interactionColumns } from "./interactions.columns";

/**
 * Interactions CRUD table for the current applicant (§8). Admin-only; the server rejects
 * a locked/archived parent, surfaced by the shell's error resolver.
 */
export const InteractionsSection = createChildResource<
  Interaction,
  InteractionPayload,
  InteractionPayload
>({
  slug: "interactions",
  moduleInfo: {
    name: "interaction",
    label: "Interactions",
    description: "Logged contacts and follow-ups for the applicant",
  },
  columns: interactionColumns,
  createFormComponent: InteractionForm,
  createModalTitle: "Add interaction",
  editModalTitle: "Edit interaction",
  modalWidth: 640,
});

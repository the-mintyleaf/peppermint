"use client";

import { createChildResource } from "../../_shared";
import type { Training } from "../../_shared";
import { TrainingForm } from "./TrainingForm";
import type { TrainingPayload } from "./TrainingForm.types";
import { trainingColumns } from "./trainings.columns";

/**
 * Training/course CRUD table for the current applicant (§9). Admin-only nested resource;
 * a locked/archived parent is rejected server-side and surfaced by the shell.
 */
export const TrainingsSection = createChildResource<
  Training,
  TrainingPayload,
  TrainingPayload
>({
  slug: "trainings",
  moduleInfo: {
    name: "training",
    label: "Trainings",
    description: "Short courses and professional training",
  },
  columns: trainingColumns,
  createFormComponent: TrainingForm,
  createModalTitle: "Add training",
  editModalTitle: "Edit training",
  modalWidth: 640,
});

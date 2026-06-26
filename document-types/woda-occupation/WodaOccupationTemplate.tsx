"use client";

import { TemplateOccupationVerification } from "@/sample/templates/woda/occupation";
import { createTemplateAdapter } from "../../utils/createTemplateAdapter";

export const WodaOccupationTemplate = createTemplateAdapter(
  TemplateOccupationVerification,
);

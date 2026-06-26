"use client";

import { TemplateRelationshipVerification } from "@/sample/templates/woda/relationship";
import { createTemplateAdapter } from "../../utils/createTemplateAdapter";

export const WodaRelationshipTemplate = createTemplateAdapter(
  TemplateRelationshipVerification,
);

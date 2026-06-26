"use client";

import { TemplateTaxClearance } from "@/sample/templates/woda/taxClearance";
import { createTemplateAdapter } from "../../utils/createTemplateAdapter";

export const WodaTaxClearanceTemplate =
  createTemplateAdapter(TemplateTaxClearance);

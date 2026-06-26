"use client";

import { TemplateBigyalaxmiStatement } from "@/sample/templates/bank/bigyalaxmi/statement";
import { createTemplateAdapter } from "../../utils/createTemplateAdapter";

export const BigyalaxmiStatementTemplate = createTemplateAdapter(
  TemplateBigyalaxmiStatement,
);

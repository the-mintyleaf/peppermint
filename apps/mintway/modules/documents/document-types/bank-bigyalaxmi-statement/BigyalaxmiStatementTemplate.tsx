"use client";

import { TemplateBigyalaxmiStatement } from "@/components/templates/bank/bigyalaxmi/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const BigyalaxmiStatementTemplate = createBankStatementTemplateAdapter(
  TemplateBigyalaxmiStatement,
);

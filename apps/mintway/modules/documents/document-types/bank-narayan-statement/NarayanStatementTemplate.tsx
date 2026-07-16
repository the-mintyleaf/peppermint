"use client";

import { TemplateNarayanStatement } from "@/components/templates/bank/narayan/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const NarayanStatementTemplate = createBankStatementTemplateAdapter(
  TemplateNarayanStatement,
);

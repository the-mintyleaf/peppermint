"use client";

import { TemplateJanautthanStatement } from "@/components/templates/bank/janautthan/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const JanautthanStatementTemplate = createBankStatementTemplateAdapter(
  TemplateJanautthanStatement,
);

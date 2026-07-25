"use client";

import { TemplateTribeniStatement } from "@/components/templates/bank/tribeni/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const TribeniStatementTemplate = createBankStatementTemplateAdapter(
  TemplateTribeniStatement,
);

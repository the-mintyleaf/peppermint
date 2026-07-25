"use client";

import { TemplateShahabhagiStatement } from "@/components/templates/bank/shahabhagi/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const ShahabhagiStatementTemplate = createBankStatementTemplateAdapter(
  TemplateShahabhagiStatement,
);

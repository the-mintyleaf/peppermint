"use client";

import { TemplateVyasStatement } from "@/components/templates/bank/vyas/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const VyasStatementTemplate = createBankStatementTemplateAdapter(
  TemplateVyasStatement,
);

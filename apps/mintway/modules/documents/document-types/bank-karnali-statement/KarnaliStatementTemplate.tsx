"use client";

import { TemplateKarnaliStatement } from "@/components/templates/bank/karnali/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const KarnaliStatementTemplate = createBankStatementTemplateAdapter(
  TemplateKarnaliStatement,
);

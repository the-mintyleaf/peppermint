"use client";

import { TemplateSumnimaStatement } from "@/components/templates/bank/sumnima/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const SumnimaStatementTemplate = createBankStatementTemplateAdapter(
  TemplateSumnimaStatement,
);

"use client";

import { TemplateSumnimaStatement } from "@/sample/templates/bank/sumnima/statement";
import { createTemplateAdapter } from "../../utils/createTemplateAdapter";

export const SumnimaStatementTemplate = createTemplateAdapter(
  TemplateSumnimaStatement,
);

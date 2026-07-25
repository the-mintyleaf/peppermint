"use client";

import { TemplateBirendranagarStatement } from "@/components/templates/bank/birendranagar/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const BirendranagarStatementTemplate =
  createBankStatementTemplateAdapter(TemplateBirendranagarStatement);

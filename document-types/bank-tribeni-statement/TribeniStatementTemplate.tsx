"use client";

import { TemplateTribeniStatement } from "@/sample/templates/bank/tribeni/statement";
import { createTemplateAdapter } from "../../utils/createTemplateAdapter";

export const TribeniStatementTemplate = createTemplateAdapter(
  TemplateTribeniStatement,
);

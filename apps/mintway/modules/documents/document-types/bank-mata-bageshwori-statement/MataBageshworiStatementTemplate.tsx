"use client";

import { TemplateMataBageshworiStatement } from "@/components/templates/bank/mataBageshwori/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const MataBageshworiStatementTemplate =
  createBankStatementTemplateAdapter(TemplateMataBageshworiStatement);

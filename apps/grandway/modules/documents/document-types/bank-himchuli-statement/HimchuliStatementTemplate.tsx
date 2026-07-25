"use client";

import { TemplateHimchuliStatement } from "@/components/templates/bank/himchuli/statement";
import { createBankStatementTemplateAdapter } from "../../utils/createTemplateAdapter";

export const HimchuliStatementTemplate = createBankStatementTemplateAdapter(
  TemplateHimchuliStatement,
);

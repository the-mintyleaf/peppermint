"use client";

import { TemplateKarnaliStatement } from "@/sample/templates/bank/karnali/statement";
import { createTemplateAdapter } from "../../utils/createTemplateAdapter";

export const KarnaliStatementTemplate = createTemplateAdapter(TemplateKarnaliStatement);

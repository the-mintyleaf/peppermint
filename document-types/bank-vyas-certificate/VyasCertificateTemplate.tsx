"use client";

import { TemplateVyasertificate } from "@/sample/templates/bank/vyas/certificate";
import { createTemplateAdapter } from "../../utils/createTemplateAdapter";

export const VyasCertificateTemplate = createTemplateAdapter(
  TemplateVyasertificate,
);

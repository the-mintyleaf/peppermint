"use client";

import { TemplateKarnaliCertificate } from "@/sample/templates/bank/karnali/certificate";
import { createTemplateAdapter } from "../../utils/createTemplateAdapter";

export const KarnaliCertificateTemplate = createTemplateAdapter(
  TemplateKarnaliCertificate,
);

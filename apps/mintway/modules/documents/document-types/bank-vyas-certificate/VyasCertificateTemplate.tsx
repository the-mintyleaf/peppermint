"use client";

import { TemplateVyasertificate } from "@/components/templates/bank/vyas/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const VyasCertificateTemplate = createBankCertificateTemplateAdapter(
  TemplateVyasertificate,
);

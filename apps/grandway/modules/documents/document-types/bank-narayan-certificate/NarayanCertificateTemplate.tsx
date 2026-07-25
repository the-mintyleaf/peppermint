"use client";

import { TemplateNarayanCertificate } from "@/components/templates/bank/narayan/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const NarayanCertificateTemplate = createBankCertificateTemplateAdapter(
  TemplateNarayanCertificate,
);

"use client";

import { TemplateKarnaliCertificate } from "@/components/templates/bank/karnali/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const KarnaliCertificateTemplate = createBankCertificateTemplateAdapter(
  TemplateKarnaliCertificate,
);

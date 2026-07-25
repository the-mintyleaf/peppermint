"use client";

import { TemplateSumnimaCertificate } from "@/components/templates/bank/sumnima/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const SumnimaCertificateTemplate = createBankCertificateTemplateAdapter(
  TemplateSumnimaCertificate,
);

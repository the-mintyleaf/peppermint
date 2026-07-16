"use client";

import { TemplateTribeniCertificate } from "@/components/templates/bank/tribeni/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const TribeniCertificateTemplate = createBankCertificateTemplateAdapter(
  TemplateTribeniCertificate,
);

"use client";

import { TemplateShahabhagiCertificate } from "@/components/templates/bank/shahabhagi/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const ShahabhagiCertificateTemplate =
  createBankCertificateTemplateAdapter(TemplateShahabhagiCertificate);

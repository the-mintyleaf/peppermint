"use client";

import { TemplateJanautthanCertificate } from "@/components/templates/bank/janautthan/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const JanautthanCertificateTemplate =
  createBankCertificateTemplateAdapter(TemplateJanautthanCertificate);

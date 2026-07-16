"use client";

import { TemplateBigyalaxmiCertificate } from "@/components/templates/bank/bigyalaxmi/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const BigyalaxmiCertificateTemplate =
  createBankCertificateTemplateAdapter(TemplateBigyalaxmiCertificate);

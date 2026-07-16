"use client";

import { TemplateBirendranagarCertificate } from "@/components/templates/bank/birendranagar/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const BirendranagarCertificateTemplate =
  createBankCertificateTemplateAdapter(TemplateBirendranagarCertificate);

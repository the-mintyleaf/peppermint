"use client";

import { TemplateMataBageshworiCertificate } from "@/components/templates/bank/mataBageshwori/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const MataBageshworiCertificateTemplate =
  createBankCertificateTemplateAdapter(TemplateMataBageshworiCertificate);

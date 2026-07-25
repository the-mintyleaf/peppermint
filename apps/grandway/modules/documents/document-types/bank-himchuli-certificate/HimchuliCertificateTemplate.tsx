"use client";

import { TemplateHimchuliCertificate } from "@/components/templates/bank/himchuli/certificate";
import { createBankCertificateTemplateAdapter } from "../../utils/createTemplateAdapter";

export const HimchuliCertificateTemplate = createBankCertificateTemplateAdapter(
  TemplateHimchuliCertificate,
);

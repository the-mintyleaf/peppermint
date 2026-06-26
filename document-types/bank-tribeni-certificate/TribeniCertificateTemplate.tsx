"use client";

import { TemplateTribeniCertificate } from "@/sample/templates/bank/tribeni/certificate";
import { createTemplateAdapter } from "../../utils/createTemplateAdapter";

export const TribeniCertificateTemplate = createTemplateAdapter(
  TemplateTribeniCertificate,
);

"use client";

import { createWodaForm } from "../../utils/sharedForms";

export const WodaFiscalForm = createWodaForm({
  wodadoc_refno: "",
  wodadoc_date: "",
  applicant_father_name: "",
  applicant_father_honorific: "",
  applicant_mother_name: "",
  applicant_mother_honorific: "",
  applicant_earning_guardian: "father",
  fiscal_fullfiscal_1: "",
  fiscal_fullfiscal_2: "",
  fiscal_fullfiscal_3: "",
  spokesperson_name: "",
  spokesperson_post: "",
  spokesperson_contact: "",
});

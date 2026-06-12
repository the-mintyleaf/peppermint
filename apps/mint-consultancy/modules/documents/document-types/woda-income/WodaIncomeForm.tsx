"use client";

import { createWodaForm } from "../../utils/sharedForms";

export const WodaIncomeForm = createWodaForm({
  wodadoc_refno: "",
  wodadoc_date: "",
  applicant_father_name: "",
  applicant_father_honorific: "",
  applicant_mother_name: "",
  applicant_mother_honorific: "",
  applicant_earning_guardian: "father",
  applicant_honorific: "",
  applicant_name: "",
  applicant_permanent_address: "",
  fiscal_1_bs: "",
  fiscal_1_ad: "",
  fiscal_2_bs: "",
  fiscal_2_ad: "",
  fiscal_3_bs: "",
  fiscal_3_ad: "",
  occupations: [],
  usd_rate: 0,
  rate_date: "",
  spokesperson_name: "",
  spokesperson_post: "",
  spokesperson_contact: "",
});

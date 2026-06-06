"use client";

import { createWodaForm } from "../../utils/sharedForms";

export const WodaDobForm = createWodaForm({
  wodadoc_refno: "",
  wodadoc_date: "",
  applicant_father_name: "",
  applicant_father_honorific: "",
  applicant_mother_name: "",
  applicant_mother_honorific: "",
  applicant_honorific: "",
  applicant_name: "",
  applicant_gender: "Male",
  applicant_permanent_address: "",
  applicant_dob: "",
  applicant_dob_bs: "",
  applicant_birth_address: "",
  applicant_citizenship: "",
  applicant_citizenship_issuer: "",
  signature_issued_act_dob: "",
  spokesperson_name: "",
  spokesperson_post: "",
  spokesperson_contact: "",
});

"use client";

import { createWodaForm } from "../../utils/sharedForms";

export const WodaOccupationForm = createWodaForm({
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
  occupations: [],
  occupation_note: "",
  pan_status: "",
  spokesperson_name: "",
  spokesperson_post: "",
  spokesperson_contact: "",
});

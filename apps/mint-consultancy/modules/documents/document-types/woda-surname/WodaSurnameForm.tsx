"use client";

import { createWodaForm } from "../../utils/sharedForms";

export const WodaSurnameForm = createWodaForm({
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
  applicant_surname_reference: "",
  applicant_surname: "",
  applicant_parents_surname: "",
  spokesperson_name: "",
  spokesperson_post: "",
  spokesperson_contact: "",
});

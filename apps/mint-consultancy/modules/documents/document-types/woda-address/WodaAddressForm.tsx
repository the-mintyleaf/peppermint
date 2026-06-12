"use client";

import { createWodaForm } from "../../utils/sharedForms";

export const WodaAddressForm = createWodaForm({
  wodadoc_refno: "",
  wodadoc_date: "",
  applicant_father_name: "",
  applicant_father_honorific: "",
  applicant_mother_name: "",
  applicant_mother_honorific: "",
  initial_address_name: "",
  applicant_permanent_address: "",
  address_name_change_date_bs: "",
  address_name_change_date: "",
  applicant_honorific: "",
  applicant_name: "",
  applicant_gender: "Male",
  spokesperson_name: "",
  spokesperson_post: "",
  spokesperson_contact: "",
});

"use client";

import { createWodaForm } from "../../utils/sharedForms";

export const WodaMigrationForm = createWodaForm({
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
  initial_address: "",
  migration_date: "",
  signature_migration_alongwith: "",
  spokesperson_name: "",
  spokesperson_post: "",
  spokesperson_contact: "",
});

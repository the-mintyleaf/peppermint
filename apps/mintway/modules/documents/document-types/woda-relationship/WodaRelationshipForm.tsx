"use client";

import { createWodaForm } from "../../utils/sharedForms";

export const WodaRelationshipForm = createWodaForm({
  wodadoc_refno: "",
  wodadoc_date: "",
  applicant_honorific: "",
  applicant_name: "",
  applicant_permanent_address: "",
  signature_issued_act_relationship: "",
  applicant_father_name: "",
  applicant_father_honorific: "",
  applicant_mother_name: "",
  applicant_mother_honorific: "",
  extra_relation: "",
  relation_extra_honorific: "",
  relation_extra_name: "",
  relation_extra_relation: "",
  spokesperson_name: "",
  spokesperson_post: "",
  spokesperson_contact: "",
});

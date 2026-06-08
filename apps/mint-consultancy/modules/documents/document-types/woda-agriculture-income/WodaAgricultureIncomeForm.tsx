"use client";

import { createWodaForm } from "../../utils/sharedForms";

export const WodaAgricultureIncomeForm = createWodaForm({
  land_plot_numbers: "",
  landowner_honorific: "Mr.",
  landowner_name: "",
  landowner_relationship: "",
  land_location: "",
  crops: "",
  annual_income_nrs: 0,
  annual_income_words: "",
});

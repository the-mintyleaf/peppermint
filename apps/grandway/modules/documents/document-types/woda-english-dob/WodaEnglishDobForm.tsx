"use client";

import { createSchemaForm } from "../../components/WodaForm";
import { WODA_LEGAL_BASIS } from "../../utils/wodaDefaults";
import { birthVerificationSchema } from "../woda-dob/WodaDobForm";

const schema = birthVerificationSchema(WODA_LEGAL_BASIS.english);

export const WodaEnglishDobForm = createSchemaForm(schema, {
  displayName: "WodaEnglishDobForm",
});

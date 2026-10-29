"use client";

import { createSchemaForm } from "../../components/WodaForm";
import { WODA_LEGAL_BASIS } from "../../utils/wodaDefaults";
import { relationshipSchema } from "../woda-relationship/WodaRelationshipForm";

const schema = relationshipSchema(WODA_LEGAL_BASIS.english);

export const WodaEnglishRelationshipForm = createSchemaForm(schema, {
  displayName: "WodaEnglishRelationshipForm",
});

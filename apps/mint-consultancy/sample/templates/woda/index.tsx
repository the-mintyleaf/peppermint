// ─── Woda Document Templates ──────────────────────────────────────────────────
// All WODA document templates

// Import individual templates
import { TemplatePermanentAddress } from "./address";
import { TemplateDOBVerification } from "./dob";
import { TemplateFiscalYear } from "./fiscal";
import { TemplateIncomeVerification } from "./income";
import { TemplateMigration } from "./migration";
import { TemplateOccupationVerification } from "./occupation";
import { TemplateRelationshipVerification } from "./relationship";
import { TemplateSurname } from "./surname";
import { TemplateTaxClearance } from "./taxClearance";

import { Stack, Container } from "@mantine/core";
import { WodaDocData } from "@/context/DocumentContext";
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { FormHandler } from "@/components/framework/FormHandler";

function WodaDocumentDisplayTemplate({ data }: { data: WodaDocData }) {
  if (!data) return null;

  // Wrap with context providers
  return (
    <ContextEditor.Provider>
      <FormHandler.Provider values={data}>
        <Container size="8.3in" px={{ base: "xs", lg: 0 }} my="md">
          <Stack gap={4}>
            {/* Relationship Verification */}
            <TemplateRelationshipVerification />

            {/* Occupation Verification */}
            <TemplateOccupationVerification />

            {/* Date of Birth Verification */}
            <TemplateDOBVerification />

            {/* Annual Income Verification */}
            <TemplateIncomeVerification />

            {/* Tax Clearance */}
            <TemplateTaxClearance />

            {/* Fiscal Year Details */}
            <TemplateFiscalYear />

            {/* Migration Certificate */}
            <TemplateMigration />

            {/* Surname Verification */}
            <TemplateSurname />

            {/* Address Change Certificate */}
            <TemplatePermanentAddress />
          </Stack>
        </Container>
      </FormHandler.Provider>
    </ContextEditor.Provider>
  );
}

// ─── Named Exports ────────────────────────────────────────────────────────────

export { WodaDocumentDisplayTemplate };

export const WodaTemplates = {
  relationship_verification: TemplateRelationshipVerification,
  occupation_verification: TemplateOccupationVerification,
  dob_verification: TemplateDOBVerification,
  annual_income_verification: TemplateIncomeVerification,
  tax_clearance: TemplateTaxClearance,
  fiscal_year_details: TemplateFiscalYear,
  migration: TemplateMigration,
  surname: TemplateSurname,
  address: TemplatePermanentAddress,
} as const;

export type WodaTemplateKey = keyof typeof WodaTemplates;

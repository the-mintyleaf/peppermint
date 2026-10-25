"use client";

import { Space, Text } from "@peppermint/ui";
import { FormHandler } from "@/components/framework/FormHandler";
import { wodaParagraphProps } from "../wodaProps";
import { kinship, text, type WodaValues } from "../wodaFormat";
import { WodaPage } from "../WodaPage";
import { WodaSubject } from "../WodaSubject";
import { WodaApplicantIdentity } from "../WodaApplicantIdentity";
import { WodaSignatureBlock } from "../WodaSignatureBlock";

/** The standard wording, used for whichever paragraph the operator leaves blank. */
function standardWording(values: WodaValues) {
  const { possessive } = kinship(values);
  return {
    statement: `This Ward Office certifies that the applicant has a nuclear family of three people. They are the applicant, ${possessive} father and mother. The applicant's grandparents are staying elsewhere, separately from the applicant's parents.`,
    note: "Therefore, the names and photos of the applicant's grandparents were not included in the family members table and photo verification under the signature in the Relationship Verification Letter provided by this Ward Office.",
  };
}

/** Japan — Family Certificate. */
export function TemplateFamilyCertificate() {
  const form = FormHandler.useForm();
  const values = form.values;
  const standard = standardWording(values);

  return (
    <WodaPage>
      <WodaSubject title="Family Certificate" variant="formal" />
      <Text {...wodaParagraphProps}>
        This is to verify that <WodaApplicantIdentity values={values} /> is a
        permanent resident of <b>{text(values.applicant_permanent_address)}</b>.
      </Text>
      <Space h=".15in" />
      <Text {...wodaParagraphProps}>
        {text(values.family_statement) || standard.statement}
      </Text>
      <Space h=".15in" />
      <Text {...wodaParagraphProps}>
        {text(values.family_note) || standard.note}
      </Text>

      <WodaSignatureBlock values={values} gap="1.2in" />
    </WodaPage>
  );
}

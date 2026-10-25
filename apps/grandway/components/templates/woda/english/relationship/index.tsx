"use client";

import { Space, Text } from "@peppermint/ui";
import { FormHandler } from "@/components/framework/FormHandler";
import { wodaParagraphProps } from "../../wodaProps";
import { text } from "../../wodaFormat";
import { WodaPage } from "../../WodaPage";
import { WodaSubject } from "../../WodaSubject";
import { WodaApplicantIdentity } from "../../WodaApplicantIdentity";
import { WodaMembersTable } from "../../WodaMembersTable";
import { WodaSignatureBlock } from "../../WodaSignatureBlock";

/** English country — Relationship Verification. */
export function TemplateEnglishRelationshipVerification() {
  const form = FormHandler.useForm();
  const values = form.values;

  return (
    <WodaPage>
      <WodaSubject title="Relationship Verification" variant="plain" />
      <Text {...wodaParagraphProps}>
        This is to verify that{" "}
        <WodaApplicantIdentity values={values} withRoleWord />, permanent
        resident of <b>{text(values.applicant_permanent_address)}</b> has the
        following relationship with the under mentioned persons.
      </Text>

      <Space h=".15in" />
      <WodaMembersTable values={values} />

      <Space h=".2in" />
      <Text {...wodaParagraphProps}>
        This letter is issued on the basis of the applicant&apos;s written
        self-declaration, official inquiry and investigation carried out at the
        local level, confirmation by competent witnesses, and in accordance with{" "}
        {text(values.signature_issued_act_relationship)}.
      </Text>

      <WodaSignatureBlock values={values} gap=".8in" />
    </WodaPage>
  );
}

"use client";

import { Space, Text } from "@peppermint/ui";
import { FormHandler } from "@/components/framework/FormHandler";
import { wodaParagraphProps } from "../../wodaProps";
import { dualDate, fullName, text } from "../../wodaFormat";
import { WodaPage } from "../../WodaPage";
import { WodaSubject } from "../../WodaSubject";
import { WodaApplicantIdentity } from "../../WodaApplicantIdentity";
import { WodaPhotoGrid } from "../../WodaPhotoGrid";
import { WodaSignatureBlock } from "../../WodaSignatureBlock";

/** English country — Date of Birth Verification. */
export function TemplateEnglishDOBVerification() {
  const form = FormHandler.useForm();
  const values = form.values;

  return (
    <WodaPage>
      <WodaSubject title="Date of Birth Verification" variant="plain" />
      <Text {...wodaParagraphProps}>
        This is to verify that{" "}
        <WodaApplicantIdentity values={values} withRoleWord />, permanent
        resident of <b>{text(values.applicant_permanent_address)}</b> was born
        on <b>{dualDate(values.applicant_dob_bs, values.applicant_dob)}</b> in{" "}
        <b>{text(values.applicant_birth_address)}</b>.
      </Text>

      <Space h=".25in" />
      <WodaPhotoGrid
        people={[
          {
            name: fullName(values.applicant_honorific, values.applicant_name),
            caption: "Applicant",
          },
        ]}
      />

      <Space h=".3in" />
      <Text {...wodaParagraphProps}>
        This letter is hereby issued in accordance with{" "}
        {text(values.signature_issued_act_dob)}.
      </Text>

      <WodaSignatureBlock values={values} gap="2in" />
    </WodaPage>
  );
}

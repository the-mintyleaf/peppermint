"use client";

import { Space, Text } from "@peppermint/ui";
import { FormHandler } from "@/components/framework/FormHandler";
import { wodaParagraphProps } from "../wodaProps";
import { dualDate, fullName, text } from "../wodaFormat";
import { WodaPage } from "../WodaPage";
import { WodaSubject } from "../WodaSubject";
import { WodaApplicantIdentity } from "../WodaApplicantIdentity";
import { WodaPhotoGrid } from "../WodaPhotoGrid";
import { WodaSignatureBlock } from "../WodaSignatureBlock";

/** Japan — Birth Verification Certificate. */
export function TemplateDOBVerification() {
  const form = FormHandler.useForm();
  const values = form.values;

  return (
    <WodaPage>
      <WodaSubject title="Birth Verification Certificate" variant="formal" />
      <Text {...wodaParagraphProps}>
        This is to verify that <WodaApplicantIdentity values={values} /> is a
        permanent resident of <b>{text(values.applicant_permanent_address)}</b>,
        was born on{" "}
        <b>{dualDate(values.applicant_dob_bs, values.applicant_dob)}</b> in{" "}
        <b>{text(values.applicant_birth_address)}</b>.
      </Text>

      <Space h=".2in" />
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

      <WodaSignatureBlock values={values} gap="1.2in" />
    </WodaPage>
  );
}

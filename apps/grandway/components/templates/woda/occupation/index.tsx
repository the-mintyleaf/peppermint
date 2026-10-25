"use client";

import { Space, Text } from "@peppermint/ui";
import { FormHandler } from "@/components/framework/FormHandler";
import { wodaParagraphProps } from "../wodaProps";
import { earningGuardian, fullName, rows, text } from "../wodaFormat";
import { WodaPage } from "../WodaPage";
import { WodaSubject } from "../WodaSubject";
import { WodaTable } from "../WodaTable";
import { WodaSignatureBlock } from "../WodaSignatureBlock";

const DEFAULT_PAN_NOTE =
  "According to the Government of Nepal, taxes are exempted for the income from Agriculture. So, it is not necessary to register on PAN.";

/** Japan — Occupation Certificate. */
export function TemplateOccupationVerification() {
  const form = FormHandler.useForm();
  const values = form.values;

  const guardian = earningGuardian(values);
  const occupationTitle = text(values.occupation_title) || "farmer";
  const activity = text(values.occupation_activity) || "farming";
  const capitalized = (word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1);
  const note = text(values.occupation_note) || DEFAULT_PAN_NOTE;

  return (
    <WodaPage>
      <WodaSubject title="Occupation Certificate" variant="formal" />
      <Text {...wodaParagraphProps}>
        This is to certify that <b>{guardian.name}</b>, {guardian.relation} of{" "}
        <b>{fullName(values.applicant_honorific, values.applicant_name)}</b>, a
        permanent resident of <b>{text(values.applicant_permanent_address)}</b>,
        is a {occupationTitle} by occupation. {capitalized(guardian.pronoun)} is
        a well-established {occupationTitle} of this ward area.{" "}
        {capitalized(guardian.possessive)} {activity} activities are as follows:
      </Text>

      <Space h=".15in" />
      <WodaTable>
        <thead>
          <tr>
            <th style={{ width: "0.55in" }}>S.N.</th>
            <th>Source of Income</th>
            <th style={{ width: "2.6in" }}>Owner</th>
          </tr>
        </thead>
        <tbody>
          {rows(values, "occupations").map((row, index) => (
            <tr key={index}>
              <td style={{ textAlign: "center" }}>{index + 1}</td>
              <td>{text(row.name)}</td>
              <td>{text(row.owner) || guardian.name}</td>
            </tr>
          ))}
        </tbody>
      </WodaTable>

      <Space h=".2in" />
      <Text {...wodaParagraphProps}>
        Note: {note}
        {!values.pan_status && (
          <>
            {" "}
            Therefore, <b>{guardian.name}</b> isn&apos;t registered on PAN.
          </>
        )}
      </Text>

      <WodaSignatureBlock values={values} gap="1.4in" />
    </WodaPage>
  );
}

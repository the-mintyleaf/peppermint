"use client";

import { Space, Text } from "@peppermint/ui";
import { FormHandler } from "@/components/framework/FormHandler";
import { wodaParagraphProps } from "../wodaProps";
import {
  earningGuardian,
  fiscalTotals,
  fiscalYears,
  fullName,
  money,
  rows,
  text,
  toAmount,
} from "../wodaFormat";
import { WodaPage } from "../WodaPage";
import { WodaSubject } from "../WodaSubject";
import { WodaTable } from "../WodaTable";
import { WodaOrdinalDate } from "../WodaOrdinalDate";
import { WodaFiscalPeriods } from "../WodaFiscalPeriods";
import { WodaSignatureBlock } from "../WodaSignatureBlock";

/** Japan — Annual Income Certificate (three fiscal years, NPR and US$). */
export function TemplateIncomeVerification() {
  const form = FormHandler.useForm();
  const values = form.values;

  const guardian = earningGuardian(values);
  const years = fiscalYears(values);
  const totals = fiscalTotals(values);
  const usdRate = toAmount(values.usd_rate);

  return (
    <WodaPage>
      <WodaSubject title="Annual Income Certificate" variant="formal" />
      <Text {...wodaParagraphProps}>
        This is to certify that <b>{guardian.name}</b>, {guardian.relation} of{" "}
        <b>{fullName(values.applicant_honorific, values.applicant_name)}</b>, a
        permanent resident of <b>{text(values.applicant_permanent_address)}</b>,
        has the following income earned in last three fiscal years. This
        certificate has been issued in reference to the sufficient relevant
        documents submitted by <b>{guardian.name}</b> and the investigation
        carried out by this Ward Office.
      </Text>

      <Space h=".15in" />
      <WodaTable>
        <thead>
          <tr>
            <th style={{ width: "0.5in" }}>S.N.</th>
            <th>Sources of Income</th>
            {years.map((year, index) => (
              <th key={index} style={{ width: "1.45in" }}>
                Fiscal Year
                <br />
                {year.label} A.D.
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows(values, "occupations").map((row, index) => (
            <tr key={index}>
              <td style={{ textAlign: "center" }}>
                <b>{index + 1}.</b>
              </td>
              <td>{text(row.name)}</td>
              {[row.income1, row.income2, row.income3].map((amount, col) => (
                <td key={col} style={{ textAlign: "center" }}>
                  {money(toAmount(amount))}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th colSpan={2}>Total Annual Income in NRs.</th>
            {totals.map((total, index) => (
              <th key={index}>{money(total)}</th>
            ))}
          </tr>
          <tr>
            <th colSpan={2}>Total Annual Income in US $</th>
            {totals.map((total, index) => (
              <th key={index}>{usdRate > 0 ? money(total / usdRate) : ""}</th>
            ))}
          </tr>
        </tbody>
      </WodaTable>

      <Space h=".15in" />
      <Text {...wodaParagraphProps} fw={700}>
        Today&apos;s Exchange Rate is 1 US Dollar ($) = NRs.{" "}
        {usdRate > 0 ? usdRate.toFixed(2) : ""} (Source: Nepal Rastra Bank for{" "}
        <WodaOrdinalDate value={values.rate_date} />)
      </Text>

      <Space h=".15in" />
      <Text {...wodaParagraphProps}>
        According to the Nepalese Fiscal year and Income Tax Act, 2058 B.S.
        (2002 A.D.) rules. The Nepalese Fiscal Year starts from the 1
        <sup style={{ fontSize: "0.6em" }}>st</sup> day of Shrawan and ends on
        the final day of Ashadh of the following year. The details about the
        fiscal years period are mentioned below:
      </Text>
      <WodaFiscalPeriods values={values} />

      <WodaSignatureBlock values={values} gap=".9in" />
    </WodaPage>
  );
}

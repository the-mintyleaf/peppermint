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
import { WodaFiscalPeriods } from "../WodaFiscalPeriods";
import { WodaSignatureBlock } from "../WodaSignatureBlock";

/** Japan — Tax Clearance Certificate. */
export function TemplateTaxClearance() {
  const form = FormHandler.useForm();
  const values = form.values;

  const guardian = earningGuardian(values);
  const years = fiscalYears(values);
  const totals = fiscalTotals(values);
  const rate = toAmount(values.tax) / 100;
  const taxes = totals.map((total) => total * rate);
  const lastYear = years[years.length - 1]?.label;
  const office = text(values.tax_clearance_issuer);

  const summaryRow = (label: string, amounts: number[]) => (
    <tr>
      <th colSpan={2} style={{ textAlign: "right" }}>
        {label}
      </th>
      {amounts.map((amount, index) => (
        <th key={index}>{money(amount)}</th>
      ))}
    </tr>
  );

  return (
    <WodaPage>
      <WodaSubject title="Tax Clearance Certificate" variant="formal" />
      <Text {...wodaParagraphProps}>
        This is to certify that <b>{guardian.name}</b>, {guardian.relation} of{" "}
        <b>{fullName(values.applicant_honorific, values.applicant_name)}</b>, a
        permanent resident of <b>{text(values.applicant_permanent_address)}</b>,
        has cleared all the Governmental Taxes up to fiscal year{" "}
        <b>{lastYear} A.D.</b> of {guardian.possessive} all applicable taxes. We
        have checked all the records with us and have found that{" "}
        {guardian.possessive} occupations are updated till this date.
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
          {summaryRow("Total Annual Income Before Tax (NRs.)", totals)}
          {summaryRow("Tax Amount (NRs.)", taxes)}
          {summaryRow(
            "Total Annual Income After Tax (NRs.)",
            totals.map((total, index) => total - taxes[index]),
          )}
          <tr>
            <th colSpan={2} style={{ textAlign: "left" }}>
              Status
            </th>
            {years.map((_, index) => (
              <th key={index}>Tax Cleared</th>
            ))}
          </tr>
        </tbody>
      </WodaTable>

      <Text {...wodaParagraphProps} mt=".1in">
        Note: - The income is calculated according to the fiscal year of Nepal.
        The Nepalese Fiscal Year starts from the middle of July to the middle of
        July every year.
      </Text>
      <Space h=".08in" />
      <WodaFiscalPeriods values={values} />

      <Space h=".15in" />
      <Text {...wodaParagraphProps}>
        If you have any query regarding the issue of this certificate, the
        related authorities are requested to contact us at Office of{" "}
        <b>{office}</b> or you could find about income tax at the website of
        Government of Nepal, Ministry of Finance, Inland Revenue Department
        (www.ird.gov.np) and Nepal Law Commission (www.lawcommission.gov.np).
      </Text>

      <WodaSignatureBlock values={values} gap=".7in" />
    </WodaPage>
  );
}

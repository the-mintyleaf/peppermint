"use client";

import { Fragment } from "react";
import { Space, Text } from "@peppermint/ui";
import { FormHandler } from "@/components/framework/FormHandler";
import { wodaParagraphProps } from "../../wodaProps";
import {
  fullName,
  incomeEarners,
  listSeparator,
  money,
  rows,
  text,
  toAmount,
} from "../../wodaFormat";
import { WodaPage } from "../../WodaPage";
import { WodaSubject } from "../../WodaSubject";
import { WodaTable } from "../../WodaTable";
import { WodaOrdinalDate } from "../../WodaOrdinalDate";
import { WodaSignatureBlock } from "../../WodaSignatureBlock";

/**
 * English country — Annual Income Verification. One fiscal year, any number
 * of earners in the family, each source with its owner and supporting record,
 * converted to the destination's currency.
 */
export function TemplateEnglishIncomeVerification() {
  const form = FormHandler.useForm();
  const values = form.values;

  const incomes = rows(values, "incomes");
  const earners = incomeEarners(values);
  const total = incomes.reduce((sum, row) => sum + toAmount(row.amount), 0);
  const rate = toAmount(values.foreign_rate);
  const currency = text(values.foreign_currency) || "Euro";
  const converted = rate > 0 ? money(total / rate) : "";
  const fiscalBs = text(values.fiscal_bs);
  const fiscalAd = text(values.fiscal_ad);

  return (
    <WodaPage>
      <WodaSubject title="Annual Income Verification" variant="plain" />
      <Text {...wodaParagraphProps}>
        This is to certify that{" "}
        {earners.map((earner, index) => (
          <Fragment key={earner.name}>
            {listSeparator(index, earners.length)}
            <b>{earner.name}</b>
            {earner.relation && ` (${earner.relation})`}
          </Fragment>
        ))}{" "}
        of <b>{fullName(values.applicant_honorific, values.applicant_name)}</b>{" "}
        (Applicant), permanent {earners.length > 1 ? "residents" : "resident"}{" "}
        of <b>{text(values.applicant_permanent_address)}</b>{" "}
        {earners.length > 1 ? "have" : "has"} annual income from various sources
        as follows:
      </Text>

      <Space h=".2in" />
      <WodaTable>
        <thead>
          <tr>
            <th style={{ width: "0.45in" }}>S.N</th>
            <th>Details of Income Source</th>
            <th style={{ width: "1.6in" }}>Owner&apos;s Name</th>
            <th style={{ width: "1.5in" }}>Annual Income (NPR)</th>
            <th style={{ width: "1.5in" }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((row, index) => (
            <tr key={index}>
              <td style={{ textAlign: "center" }}>{index + 1}</td>
              <td>
                {text(row.source)}
                {text(row.detail) && (
                  <>
                    <br />
                    <span style={{ fontSize: "0.8em" }}>
                      ({text(row.detail)})
                    </span>
                  </>
                )}
              </td>
              <td style={{ textAlign: "center" }}>{text(row.owner)}</td>
              <td style={{ textAlign: "center" }}>
                {money(toAmount(row.amount))}
              </td>
              <td style={{ textAlign: "center" }}>{text(row.remarks)}</td>
            </tr>
          ))}
          <tr>
            <td />
            <th style={{ textAlign: "right" }}>Grand Total</th>
            <th>In NPR</th>
            <th>{money(total)}</th>
            <td />
          </tr>
          <tr>
            <td />
            <td />
            <th>In {currency.toUpperCase()}</th>
            <th>{converted}</th>
            <td />
          </tr>
        </tbody>
      </WodaTable>

      <Space h=".25in" />
      <Text {...wodaParagraphProps}>
        The total annual income for the fiscal year{" "}
        <b>
          {fiscalBs} B.S.{fiscalAd && ` (${fiscalAd} A.D.)`}
        </b>{" "}
        is <b>NPR. {money(total)}</b>, equivalent to{" "}
        <b>
          {currency} {converted}
        </b>
      </Text>
      <Text {...wodaParagraphProps} fw={700}>
        Note: According to the foreign exchange rate {currency} 1 = NPR{" "}
        {rate > 0 ? rate.toFixed(2) : ""} As of{" "}
        <WodaOrdinalDate value={values.rate_date} /> (Source: Nepal Rastra Bank)
      </Text>

      <WodaSignatureBlock values={values} gap="1.4in" />
    </WodaPage>
  );
}

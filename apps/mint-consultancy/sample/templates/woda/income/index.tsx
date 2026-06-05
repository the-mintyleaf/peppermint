"use client";
import React, { useContext } from "react";
//mantine
import {
  Center,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Space,
  Text,
} from "@mantine/core";
//styles
import classes from "./income.module.css";
//pageprops
import { configPageProps } from "../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { wodaTextProps, wodaTitleProps } from "../wodaProps";
import { FormHandler } from "@/components/framework/FormHandler";
import { getDaySuffix } from "@/components/helper/getDaySuffix";

export function TemplateIncomeVerification() {
  // * DEFINITION

  const form = FormHandler.useForm();

  // * PRE STATES

  // * STATES

  // * CONTEXT

  const { state, dispatch } = useContext(ContextEditor.Context);
  const { details } = state;

  // * PRELOAD

  // * FUNCTIONS

  // * COMPONENTS

  const propsText = wodaTextProps;
  const propsTitle = wodaTitleProps;

  const guardian_father = {
    name: form.values?.applicant_father_name,
    relationship: "Father",
    honorific: form.values?.applicant_father_honorific,
  };
  const guardian_mother = {
    name: form.values?.applicant_mother_name,
    relationship: "Mother",
    honorific: form.values?.applicant_mother_honorific,
  };
  const guardian_earning =
    form.values?.applicant_earning_guardian == "father"
      ? guardian_father
      : guardian_mother;

  const calculateFiscalTotals = () => {
    const sum = [0, 0, 0];
    for (const occupation of form.values?.occupations ?? []) {
      sum[0] += occupation.income1 ?? 0;
      sum[1] += occupation.income2 ?? 0;
      sum[2] += occupation.income3 ?? 0;
    }
    return sum;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fiscalTotals = calculateFiscalTotals();

  return (
    <>
      <Paper p=".6in" className={classes.root} {...configPageProps}>
        <Space h={state?.headerProps?.height + "in" || "1in"} />
        <Group
          gap="4px"
          style={{
            opacity: state?.headerProps?.enable ? 0 : 1,
          }}
        >
          <Text {...propsText} fw={600}>
            Ref. No.:
          </Text>
          <Text {...propsText}>{form.values?.wodadoc_refno}</Text>
        </Group>
        <Group
          justify="space-between"
          style={{
            opacity: state?.headerProps?.enable ? 0 : 1,
          }}
        >
          <Group gap="4px">
            <Text {...propsText} fw={600}>
              Dispatch No.:
            </Text>
          </Group>
          <Group gap="4px">
            <Text {...propsText} fw={600}>
              Date:
            </Text>
            <Text {...propsText}>
              {form.values?.wodadoc_date ? (
                <>
                  {new Date(form.values?.wodadoc_date || "").getDate()}
                  <span
                    style={{
                      verticalAlign: "super",
                      fontSize: 8,
                    }}
                  >
                    {getDaySuffix(
                      new Date(form.values?.wodadoc_date).getDate()
                    )}
                  </span>{" "}
                  {monthNames[new Date(form.values?.wodadoc_date).getMonth()]},{" "}
                  {new Date(form.values?.wodadoc_date).getFullYear()}
                </>
              ) : (
                <span style={{ display: "inline-block", width: 100 }}></span>
              )}
            </Text>
          </Group>
        </Group>
        <Divider
          opacity={!state.headerProps?.enableLine ? 1 : 0}
          size={1}
          color="dark.9"
          mt="xs"
          mb="sm"
        />
        <Text
          {...propsTitle}
          ta="center"
          tt="uppercase"
          td="underline"
          fw={600}
          mt={".2in"}
        >
          ANNUAL INCOME VERIFICATION CERTIFICATE
          <br /> to whom it may concern
        </Text>
        <Space h=".35in" />
        <Text
          style={{
            textAlign: "justify",
          }}
          {...propsText}
        >
          This is to certify that{" "}
          <b>
            {guardian_earning.honorific} {guardian_earning.name}
          </b>
          , {form.values?.applicant_earning_guardian} of{" "}
          <b>
            {form.values?.applicant_honorific} {form.values?.applicant_name}
          </b>
          , a permanent resident of{" "}
          <b>{form.values?.applicant_permanent_address}</b> has the following
          source of income for the last three fiscal years: B.S.{" "}
          {form.values?.fiscal_1_bs} ({form.values?.fiscal_1_ad} A.D.), B.S.{" "}
          {form.values?.fiscal_2_bs} ({form.values?.fiscal_2_ad} A.D.) and B.S.{" "}
          {form.values?.fiscal_3_bs} ({form.values?.fiscal_3_ad} A.D.).
        </Text>

        <Space h=".12in" />

        <table className={classes.table}>
          <thead>
            <tr>
              <th style={{ width: 50 }} rowSpan={2}>
                <Text fw={600}>S.N.</Text>
              </th>
              <th style={{ width: 220 }} rowSpan={2}>
                <Text fw={600}>Income Headings</Text>
              </th>
              <th colSpan={3}>
                <Text fw={600} lh=".2in">
                  Fiscal Year
                </Text>
              </th>
            </tr>
            <tr>
              <th>
                <Text lh=".2in" fw={600}>
                  B.S. {form.values?.fiscal_1_bs}
                  <br />
                  {form.values?.fiscal_1_ad} A.D.
                </Text>
              </th>
              <th>
                <Text lh=".2in" fw={600}>
                  B.S. {form.values?.fiscal_2_bs}
                  <br />
                  {form.values?.fiscal_2_ad} A.D.
                </Text>
              </th>
              <th>
                <Text lh=".2in" fw={600}>
                  B.S. {form.values?.fiscal_3_bs}
                  <br />
                  {form.values?.fiscal_3_ad} A.D.
                </Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {(form.values?.occupations ?? []).map(
              (occupationinfo: any, index: number) => (
                <tr key={index}>
                  <td
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <Text lh=".28in">{index + 1}.</Text>
                  </td>
                  <td>
                    <Text lh=".2in">{occupationinfo.name}</Text>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      lineHeight: ".2in",
                    }}
                  >
                    {Number(occupationinfo?.income1).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      lineHeight: ".2in",
                    }}
                  >
                    {Number(occupationinfo?.income2).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      lineHeight: ".2in",
                    }}
                  >
                    {Number(occupationinfo?.income3).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              )
            )}
            <tr>
              <td
                colSpan={2}
                style={{
                  textAlign: "right",
                }}
              >
                <Text fw={600} lh=".2in">
                  Total Amount in NRs.
                </Text>
              </td>
              {fiscalTotals.map((total, index) => (
                <td
                  key={index}
                  style={{ textAlign: "center", lineHeight: ".2in" }}
                >
                  <Text fw={600} lh=".2in">
                    {total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </td>
              ))}
            </tr>
            <tr>
              <td
                colSpan={2}
                style={{
                  textAlign: "right",
                }}
              >
                <Text fw={600} lh=".2in">
                  Total Amount in USD
                </Text>
              </td>
              {fiscalTotals.map((total, index) => (
                <td
                  key={index}
                  style={{ textAlign: "center", lineHeight: ".2in" }}
                >
                  <Text fw={600} lh=".2in">
                    {(total / (form.values?.usd_rate || 1)).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <Space h=".12in" />

        <Text
          {...propsText}
          style={{
            textAlign: "justify",
          }}
          lh={1.3}
        >
          The conversion of the Nepali Currency (NPR) into US Dollars (US$) is
          done as per the foreign currency exchange rate (selling rate)
          determined by Nepal Rastra Bank (www.nrb.org.np) on{" "}
          <b>
            {form.values?.rate_date ? (
              <>
                {new Date(form.values.rate_date).getDate()}
                <span
                  style={{
                    verticalAlign: "super",
                    fontSize: 8,
                    marginTop: -10,
                  }}
                >
                  {getDaySuffix(new Date(form.values.rate_date).getDate())}
                </span>{" "}
                {monthNames[new Date(form.values.rate_date).getMonth()]},{" "}
                {new Date(form.values.rate_date).getFullYear()} A.D.
              </>
            ) : (
              <span style={{ display: "inline-block", width: 120 }}></span>
            )}
          </b>{" "}
          which is <b> 1 US$ = {form.values?.usd_rate?.toFixed(2)} NPR</b>.
        </Text>

        <Space h="1.5in" />

        <SimpleGrid cols={2}>
          <div />

          <div
            style={{
              paddingLeft: ".7in",
            }}
          >
            <div
              style={{
                display: "block",
                borderBottom: "2px dotted black",
                width: 200,
                margin: "auto",
              }}
            />

            <Text {...propsText} size="15.4px" fw={600} ta="center" mt=".04in">
              {form.values?.spokesperson_name}
            </Text>
            <Text {...propsText} size="15.4px" fw={600} ta="center">
              {form.values?.spokesperson_post}
            </Text>
            {form.values?.spokesperson_contact && (
              <Text {...propsText} size="15.4px" fw={600} ta="center">
                Contact No.: {form.values?.spokesperson_contact}
              </Text>
            )}
          </div>
        </SimpleGrid>
      </Paper>
    </>
  );
}

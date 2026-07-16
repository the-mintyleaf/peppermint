"use client";

import { useContext } from "react";
//mantine
import {
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Space,
  Stack,
  Text,
} from "@peppermint/ui";
//pageprops
import { configPageProps } from "../../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { BankPaddingSpace } from "@/components/templates/bank/BankPaddingSpace";
//style
import classesTemplate from "../template.module.css";
import classes from "./certificate.module.css";
import { dayjs } from "@peppermint/ui";
import { FormHandler } from "@/components/framework/FormHandler";
//templateprops

export function TemplateKarnaliCertificate() {
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

  // * MISC

  const _defaultTextProps = {
    size: "15px",
    lh: ".17in",
  };

  const applicantDetails: any[] = [
    {
      label: "Account Number",
      value: form.values?.statement_account_no,
    },
    {
      label: "Account Type",
      value: form.values?.statement_account_type,
    },
    {
      label: "Interest Rate",
      value: `${form.values?.statement_interest}%`,
    },
    {
      label: "Tax Rate",
      value: `${form.values?.statement_tax}%`,
    },

    {
      label: "Account Holder's Name",
      value: form.values?.statement_account_holder,
    },
    {
      label: "Account Holder's Address",
      value: form.values?.statement_account_address,
    },

    {
      label: "Available Balance",
      value: (form.values?.statement_total_balance || 0).toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      ),
    },
    {
      label: "Amount in Words",
      value: form.values?.statement_total_balance_words,
    },
    {
      label: "Equivalent to",
      value:
        "US$ " +
        (
          form.values?.statement_balance_total_number /
          form.values?.statement_usdrate
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      label: "Exchange Rate",
      value: `1 US$ = NPR. ${form.values?.statement_usdrate?.toFixed(
        2,
      )} (Source: www.nrb.org.np)`,
    },
  ];

  return (
    <>
      <Paper p="1in" className={classesTemplate.root} {...configPageProps}>
        <BankPaddingSpace position="top" />

        <Group justify="space-between">
          <Text {..._defaultTextProps}>
            <b>Ref. No.</b> : {form.values?.statement_ref_no}
          </Text>

          <Text {..._defaultTextProps}>
            <b>Date</b> :{" "}
            {dayjs(form.values?.statement_end_date, "DD/MM/YYYY")
              .add(1, "day")
              .format("YYYY/MM/DD")}
          </Text>
        </Group>

        <Space h=".5in" />

        <Text
          {..._defaultTextProps}
          size="20px"
          lh=".3in"
          ta="center"
          tt="uppercase"
          fw={700}
        >
          BALANCE CERTIFICATE
          <br /> To Whom it May Concern
        </Text>

        <Space h=".3in" />

        <Text {..._defaultTextProps} lh=".2in" ta="justify">
          This is to certify that following person has been operating bank
          account in our Co-operative.
          <br />
          Detail information about the account is as follows:
        </Text>

        <Space h=".3in" />

        <table className={classes.table}>
          <tbody>
            {applicantDetails?.map((data: any, index: number) => (
              <tr
                key={index}
                style={{
                  height: 20,
                }}
              >
                <td>
                  <Text ta="left" {..._defaultTextProps} w={200}>
                    {data.label}
                  </Text>
                </td>
                <td>
                  <Text ta="left" {..._defaultTextProps} w={40}>
                    :
                  </Text>
                </td>
                <td>
                  <Text {..._defaultTextProps}>{data.value}</Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Space h=".5in" />

        <Text {..._defaultTextProps} lh=".2in" ta="justify">
          This certificate has been issued in reply to the written application
          of account holder.
          <br />
          Conversion of Nepalese Rupees to any foreign currency are regulated
          through prevailing rules and regulations by Nepal Rastra Bank.
        </Text>

        <Space h="2in" />

        <Group justify="flex-end">
          <div>
            <Group justify="flex-end">
              <div
                style={{
                  display: "block",
                  width: "200px",
                  borderBottom: "2px dotted black",
                  marginBottom: ".01in",
                }}
              />
            </Group>

            <Text {..._defaultTextProps} ta="right" mt=".1in">
              {form.values?.statement_spokesperson}
            </Text>
            <Text {..._defaultTextProps} ta="right">
              {form.values?.statement_spokesperson_post}
            </Text>
          </div>
        </Group>
        <BankPaddingSpace position="bottom" />
      </Paper>
    </>
  );
}

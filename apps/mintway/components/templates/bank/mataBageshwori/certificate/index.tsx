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
import { FormHandler } from "@/components/framework/FormHandler";
import { dayjs } from "@peppermint/ui";
//templateprops

// * DEFINITION

export function TemplateMataBageshworiCertificate() {
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
    size: "14px",
    lh: ".17in",
    style: {
      letterSpacing: "-1px",
    },
  };

  const applicantDetails: any[] = [
    {
      label: "Reference No",
      value: form.values?.statement_ref_no, // You can update this value accordingly
      transform: "uppercase",
    },
    {
      label: "Account Name",
      value: form.values?.statement_account_holder,
      transform: "uppercase",
    },
    {
      label: "Account Number",
      value: form.values?.statement_account_no,
      transform: "uppercase",
    },
    {
      label: "Account Type",
      value: form.values?.statement_account_type,
      transform: "uppercase",
    },
    {
      label: "Currency",
      value: "NPR",
      transform: "uppercase",
    },
    {
      label: "Has Balance of",
      value:
        "NPR " +
        (form.values?.statement_total_balance || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      transform: "uppercase",
    },
    {
      label: "In Words",
      value: form.values?.statement_total_balance_words,
    },
    {
      label: "Which is equivalent to",
      value:
        "USD " +
        (
          form.values?.statement_balance_total_number /
          form.values?.statement_usdrate
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      label: "In Words",
      value: form.values?.statement_total_balance_words_usd, // Update with appropriate value
    },
  ];

  return (
    <>
      <Paper
        py=".6in"
        px="1in"
        className={classesTemplate.root}
        {...configPageProps}
      >
        <BankPaddingSpace position="top" />

        <Text fw={600} {..._defaultTextProps}>
          DATE :{" "}
          {dayjs(form.values?.statement_end_date)
            .add(1, "day")
            .format("YYYY/MM/DD")}
        </Text>

        <Space h=".5in" />

        <Stack gap={4}>
          <Text td="underline" ta="center" fw={800} size={"20px"}>
            BALANCE CERTIFICATE
          </Text>
          <Text td="underline" ta="center" fw={800} size={"20px"}>
            TO WHOM IT MAY CONCERN
          </Text>
        </Stack>

        <Space h=".5in" />

        <Text ta="justify" fw={600} {..._defaultTextProps}>
          This is to certify that account holder of the bank having following
          details:
        </Text>

        <Space h=".5in" />

        <table className={classes.table}>
          <tbody>
            {applicantDetails?.map((data: any, index: number) => (
              <tr key={index}>
                <td style={{ width: 200, height: 25 }}>
                  <Grid>
                    <Grid.Col span={11}>
                      <Text {..._defaultTextProps} fw={700}>
                        {data.label}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text ta="right" {..._defaultTextProps} fw={700}>
                        :
                      </Text>
                    </Grid.Col>
                  </Grid>
                </td>
                <td>
                  <Text
                    fw={600}
                    {..._defaultTextProps}
                    tt={data.transform}
                    pl="8px"
                  >
                    {data.value}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Space h=".5in" />

        <Text ta="justify" fw={600} {..._defaultTextProps}>
          This certificate has been issued as per the request of the afore
          stated account holder without any obligation on the part of the bank
          and its officials.
        </Text>

        <Space h=".15in" />

        <Text ta="justify" fw={600} {..._defaultTextProps}>
          Exchange rate as of{" "}
          {dayjs(form.values?.statement_end_date)
            .add(1, "day")
            .format("YYYY/MM/DD")}{" "}
          is USD 1 = NPR{" "}
          {form.values?.statement_usdrate?.toFixed(2).toLocaleString("en-US")}
        </Text>

        <Space h=".5in" />

        <div
          style={{
            display: "block",
            width: "1.2in",
            borderBottom: "2px dotted black",
            marginBottom: ".01in",
          }}
        />

        <Space h=".05in" />

        <Text ta="justify" fw={600} {..._defaultTextProps}>
          {form.values?.statement_spokesperson}
        </Text>
        <Text ta="justify" fw={600} {..._defaultTextProps}>
          {form.values?.statement_spokesperson_post}
        </Text>
        <BankPaddingSpace position="bottom" />
      </Paper>
    </>
  );
}

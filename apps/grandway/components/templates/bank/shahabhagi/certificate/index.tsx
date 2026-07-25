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

export function TemplateShahabhagiCertificate() {
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
    style: {},
  };

  const applicantDetails: any[] = [
    // {
    //   label: "Reference No",
    //   value: "MR/CCI/4597/080/081", // You can update this value accordingly
    //   transform: "uppercase",
    // },
    {
      label: "Name",
      value: form.values?.statement_account_holder,
      transform: "capitalize",
    },
    {
      label: "Address",
      value: form.values?.statement_account_address,
      transform: "capitalize",
    },
    {
      label: "A/C Number",
      value: form.values?.statement_account_no,
      transform: "capitalize",
    },
    {
      label: "Interest Rate",
      value: `${form.values?.statement_interest}%`,
    },
    {
      label: "Account Type",
      value: form.values?.statement_account_type,
      transform: "capitalize",
    },
    {
      label: "Tax Rate",
      value: `${form.values?.statement_tax}%`,
    },
    {
      label: "Currency",
      value: "NPR",
      transform: "capitalize",
    },
    {
      label: "Has Balance of",
      value:
        "NPR " +
        (form.values?.statement_total_balance || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      transform: "capitalize",
    },

    {
      label: "Has Balance of",
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

        <Text fw={400} {..._defaultTextProps} ta="right">
          Date :{" "}
          {dayjs(form.values?.statement_end_date)
            .add(1, "day")
            .format("YYYY-MM-DD")}
        </Text>

        <Space h=".5in" />

        <Stack gap={4}>
          <Text td="underline" ta="center" fw={800} size={"20px"}>
            BALANCE CERTIFICATE
          </Text>
          <Text mt="xs" td="underline" ta="center" fw={800} size={"20px"}>
            To Whom It May Concern
          </Text>
        </Stack>

        <Space h=".5in" />

        <Text ta="justify" fw={400} {..._defaultTextProps}>
          This is to certify that account holder as mentioned below:
        </Text>

        <Space h=".3in" />

        <table className={classes.table}>
          <tbody>
            {applicantDetails?.map((data: any, index: number) => (
              <tr key={index}>
                <td style={{ width: 150, height: 25 }}>
                  <Grid>
                    <Grid.Col span={10}>
                      <Text {..._defaultTextProps} fw={600}>
                        {data.label}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text ta="right" {..._defaultTextProps} fw={700}>
                        :
                      </Text>
                    </Grid.Col>
                  </Grid>
                </td>
                <td>
                  <Text
                    fw={400}
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

        <Space h=".3in" />

        <Text ta="justify" fw={400} {..._defaultTextProps}>
          As per todays currency exchange rate of 1 USD equivalent to NPR{" "}
          {form.values?.statement_usdrate?.toFixed(2).toLocaleString("en-US")}
        </Text>

        <Space h=".15in" />

        <Text ta="justify" fw={400} {..._defaultTextProps}>
          This certificate has been issued as per the request of the afore
          stated account holder without any obligation on the part of the
          Organization and its officials.
        </Text>

        <Space h=".8in" />

        <div
          style={{
            display: "block",
            width: "1.2in",
            borderBottom: "2px dotted black",
            marginBottom: ".01in",
          }}
        />

        <Space h=".1in" />

        <Text ta="justify" fw={400} {..._defaultTextProps}>
          {form.values?.statement_spokesperson}
        </Text>
        <BankPaddingSpace position="bottom" />
      </Paper>
    </>
  );
}

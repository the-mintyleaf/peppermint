/* eslint-disable react/no-unescaped-entities */
"use client";

import { useContext } from "react";
//mantine
import { Grid, Group, Paper, SimpleGrid, Space, Text } from "@mantine/core";
//pageprops
import { configPageProps } from "../../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
//style
import classesTemplate from "../template.module.css";
import classes from "./certificate.module.css";
import { FormHandler } from "@/components/framework/FormHandler";
import dayjs from "dayjs";
//templateprops

export function TemplateSumnimaCertificate() {
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
    size: "16px",
    lh: ".17in",
  };

  const applicantDetails: any[] = [
    {
      label: "Name",
      value: form.values?.statement_account_holder,
    },
    {
      label: "Address",
      value: form.values?.statement_account_address,
    },
    {
      label: "A/c Type",
      value: form.values?.statement_account_type,
    },
    {
      label: "A/c No.",
      value: form.values?.statement_account_no,
    },
    {
      label: "Interest",
      value: `${form.values?.statement_interest}%`,
    },
    {
      label: "Tax",
      value: `${form.values?.statement_tax}%`,
    },
    {
      label: "Member ID",
      value: form.values?.statement_member_id,
    },
    {
      label: "Currency",
      value: "NPR",
    },
    {
      label: "Has Balance in NPR",
      value: (form.values?.statement_total_balance || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    {
      label: "Has Balance in USD",
      value: (
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
      <Paper p=".6in" className={classesTemplate.root} {...configPageProps}>
        <Space h={state?.headerProps?.height + "in" || "1in"} />

        <Grid>
          <Grid.Col span={7}>
            <Text {..._defaultTextProps}>
              <b>Ref. No.</b>: {form.values?.statement_ref_no}
            </Text>
          </Grid.Col>
          <Grid.Col span={5}>
            <Text {..._defaultTextProps} ta="right">
              <b>Date of Issue</b>:{" "}
              {dayjs(form.values?.statement_end_date)
                .add(1, "day")
                .format("YYYY/MM/DD")}{" "}
            </Text>
          </Grid.Col>
        </Grid>

        <Space h=".5in" />

        <Text
          lh=".3in"
          ta="center"
          size="22px"
          tt="capitalize"
          td="underline"
          fw={700}
        >
          Balance Certificate
          <br />
          To Whom it May Concern
        </Text>

        <Space h=".5in" />

        <table className={classes.table}>
          <tbody>
            {applicantDetails?.map((data: any, index: number) => (
              <tr key={index}>
                <td>
                  <Text ta="left" {..._defaultTextProps} fw={700} w={200}>
                    {data.label}
                  </Text>
                </td>
                <td>
                  <Text ta="left" {..._defaultTextProps} fw={700}>
                    :
                  </Text>
                </td>
                <td>
                  <Text w={300} {..._defaultTextProps}>
                    {data.value}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Space h=".3in" />

        <Text {..._defaultTextProps}>
          As per today&apos;s currency exchange rate of <b>1 USD</b> equivalent
          to{" "}
          <b>
            NPR{" "}
            {form.values?.statement_usdrate?.toFixed(2).toLocaleString("en-US")}
          </b>
        </Text>

        <Space h=".3in" />

        <Text {..._defaultTextProps} pr=".5in" ta="justify">
          This certificate has been issued as per the request of the afore
          stated account holder without any obligation on the part of the
          Co-Operative and its officials.
        </Text>

        <Space h="2in" />

        <Group justify="flex-end">
          <div>
            <Group justify="center">
              <div
                style={{
                  display: "block",
                  width: "1.3in",
                  borderBottom: "2px dotted black",
                  marginBottom: ".01in",
                }}
              />
            </Group>

            <Text {..._defaultTextProps} fw={600} ta="center" mt=".04in">
              {form.values?.statement_spokesperson}
              <br />({form.values?.statement_spokesperson_post})
            </Text>
          </div>
        </Group>
      </Paper>
    </>
  );
}

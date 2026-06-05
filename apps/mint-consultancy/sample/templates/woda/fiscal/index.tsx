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
import classes from "./fiscal.module.css";
//pageprops
import { configPageProps } from "../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { wodaTextProps, wodaTitleProps } from "../wodaProps";
import { FormHandler } from "@/components/framework/FormHandler";
import { getDaySuffix } from "@/components/helper/getDaySuffix";

export function TemplateFiscalYear() {
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
        >
          Fiscal Year Verification Certificate
          <br /> to whom it may concern
        </Text>
        <Space h="sm" />
        <Text
          style={{
            textAlign: "justify",
          }}
          {...propsText}
          lh=".2in"
        >
          According to the Nepal Government Income Tax Act B.S. 2058, the
          Nepalese fiscal year starts from the 1
          <span
            style={{
              verticalAlign: "super",
              fontSize: 8,
            }}
          >
            st
          </span>{" "}
          Shrawan and closes on the last Ashadh, so it is certified that the
          annual income has been verified as the Nepalese fiscal year.
        </Text>
        <Space h=".08in" />
        <ol style={{ padding: 0, paddingLeft: 16, margin: 0 }}>
          <li style={{ textAlign: "justify", lineHeight: ".2in" }}>
            {form.values?.fiscal_fullfiscal_1}
          </li>
          <li style={{ textAlign: "justify", lineHeight: ".2in" }}>
            {form.values?.fiscal_fullfiscal_2}
          </li>
          <li style={{ textAlign: "justify", lineHeight: ".2in" }}>
            {form.values?.fiscal_fullfiscal_3}
          </li>
        </ol>

        <Space h="2in" />

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

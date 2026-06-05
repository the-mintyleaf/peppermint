/* eslint-disable react/no-unescaped-entities */
"use client";
import { useContext } from "react";
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
import classes from "./occupation.module.css";
//pageprops
import { configPageProps } from "../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { wodaTextProps, wodaTitleProps } from "../wodaProps";
import { FormHandler } from "@/components/framework/FormHandler";
import { getDaySuffix } from "@/components/helper/getDaySuffix";

export function TemplateOccupationVerification() {
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
          mb=".18in"
        />
        <Text
          {...propsTitle}
          ta="center"
          tt="uppercase"
          td="underline"
          fw={600}
          mt={".2in"}
        >
          Occupation Verification Certificate
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
            {form.values?.applicant_earning_guardian == "father"
              ? guardian_father.honorific
              : guardian_mother.honorific}{" "}
            {form.values?.applicant_earning_guardian == "father"
              ? guardian_father.name
              : guardian_mother.name}
          </b>
          ,{" "}
          {form.values?.applicant_earning_guardian == "father"
            ? "father"
            : "mother"}{" "}
          of{" "}
          <b>
            {form.values?.applicant_honorific} {form.values?.applicant_name}
          </b>
          , a permanent resident of{" "}
          <b>{form.values?.applicant_permanent_address}</b> is found to be
          engaged in the following occupations as the means to generate income.
        </Text>

        <Space h=".12in" />

        <table className={classes.table}>
          <thead>
            <tr>
              <th>
                <Text fw={600} w=".4in" ta="center">
                  S.N.
                </Text>
              </th>
              <th>
                <Text fw={600}> Occupation</Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {form.values?.occupations?.map(
              (occupationinfo: any, index: number) => (
                <tr key={index}>
                  <td style={{ textAlign: "center" }}>
                    <Text>{index + 1}.</Text>
                  </td>
                  <td
                    style={{
                      width: "3.9in",
                    }}
                  >
                    <Text>{occupationinfo.name}</Text>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        <Space h=".15in" />

        <Text
          style={{
            textAlign: "justify",
          }}
          {...propsText}
        >
          {form.values?.occupation_note}{" "}
          {form.values?.pan_status ? (
            " "
          ) : (
            <>
              Therefore,{" "}
              <b>
                {" "}
                {form.values?.applicant_earning_guardian == "father"
                  ? guardian_father.honorific
                  : guardian_mother.honorific}{" "}
                {form.values?.applicant_earning_guardian == "father"
                  ? guardian_father.name
                  : guardian_mother.name}
              </b>{" "}
              isn't registered on PAN.
            </>
          )}
        </Text>

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

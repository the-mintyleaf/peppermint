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
import classes from "./address.module.css";
//pageprops
import { configPageProps } from "../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { wodaTextProps, wodaTitleProps } from "../wodaProps";
import { FormHandler } from "@/components/framework/FormHandler";
import { getDaySuffix } from "@/components/helper/getDaySuffix";

export function TemplatePermanentAddress() {
  // * DEFINITION
  const form = FormHandler.useForm();

  // * PRE STATES

  // * STATES

  // * CONTEXT

  const { state, dispatch } = useContext(ContextEditor.Context);
  const { details } = state;

  // * PRELOAD

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

  return (
    <>
      <Paper p=".8in" className={classes.root} {...configPageProps}>
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
          mb="xl"
        />
        <Text
          {...propsTitle}
          lh="22px"
          ta="center"
          td="underline"
          fw={600}
          tt="uppercase"
        >
          PERMANENT ADDRESS VERIFICATION
          <br /> To Whom It May Concern
        </Text>

        <Space h=".35in" />

        <Text
          style={{
            textAlign: "justify",
          }}
          {...propsText}
          lh=".27in"
          size="15.4px"
        >
          This is to certify that <b>{form.values?.initial_address_name}</b>, is
          upgraded to <b>{form.values?.applicant_permanent_address}</b>, from{" "}
          {form.values?.address_name_change_date_bs} B.S. ({" "}
          {form.values?.address_name_change_date ? (
            <>
              {new Date(form.values?.address_name_change_date || "").getDate()}
              <span
                style={{
                  verticalAlign: "super",
                  fontSize: 8,
                }}
              >
                {getDaySuffix(
                  new Date(form.values?.address_name_change_date).getDate()
                )}
              </span>{" "}
              {
                monthNames[
                  new Date(form.values?.address_name_change_date).getMonth()
                ]
              }
              , {new Date(form.values?.address_name_change_date).getFullYear()}
            </>
          ) : (
            <span style={{ display: "inline-block", width: 100 }}></span>
          )}{" "}
          A.D.). Therefore, the permanent address of{" "}
          <b>
            {form.values?.applicant_honorific} {form.values?.applicant_name}
          </b>
          , {form.values?.applicant_gender == "Male" ? "son" : "daughter"} of{" "}
          <b>
            {guardian_father.honorific} {guardian_father.name}
          </b>{" "}
          and{" "}
          <b>
            {guardian_mother.honorific} {guardian_mother.name}
          </b>{" "}
          has changed from <b>{form.values?.initial_address_name}</b> to{" "}
          <b>{form.values?.applicant_permanent_address}</b> from the date of
          upgrading.
        </Text>

        <Space h="1.2in" />

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

"use client";
import React, { useContext } from "react";
import { Divider, Group, Paper, SimpleGrid, Space, Text } from "@peppermint/ui";
import classes from "./agriculture-income.module.css";
import { configPageProps } from "../../templateprops";
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { wodaTextProps, wodaTitleProps } from "../wodaProps";
import { FormHandler } from "@/components/framework/FormHandler";
import { getDaySuffix } from "@/components/helper/getDaySuffix";

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

export function TemplateAgricultureIncome() {
  const form = FormHandler.useForm();
  const { state } = useContext(ContextEditor.Context);

  const propsText = wodaTextProps;
  const propsTitle = wodaTitleProps;

  const formattedDate = form.values?.wodadoc_date ? (
    (() => {
      const d = new Date(form.values.wodadoc_date);
      return (
        <>
          {d.getDate()}
          <span style={{ verticalAlign: "super", fontSize: 8 }}>
            {getDaySuffix(d.getDate())}
          </span>{" "}
          {monthNames[d.getMonth()]}, {d.getFullYear()}
        </>
      );
    })()
  ) : (
    <span style={{ display: "inline-block", width: 100 }} />
  );

  const formattedIncome = Number(
    form.values?.annual_income_nrs ?? 0,
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <>
      <Paper p=".6in" className={classes.root} {...configPageProps}>
        <Space h={state?.headerProps?.height + "in" || "1in"} />

        <Group
          gap="4px"
          style={{ opacity: state?.headerProps?.enable ? 0 : 1 }}
        >
          <Text {...propsText} fw={600}>
            Ref. No.:
          </Text>
          <Text {...propsText}>{form.values?.wodadoc_refno}</Text>
        </Group>

        <Group
          justify="space-between"
          style={{ opacity: state?.headerProps?.enable ? 0 : 1 }}
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
            <Text {...propsText}>{formattedDate}</Text>
          </Group>
        </Group>

        <Divider
          opacity={!state.headerProps?.enableLine ? 1 : 0}
          size={1}
          color="dark.9"
          mt="xs"
          mb="sm"
        />

        <Text {...propsTitle} ta="center" td="underline" fw={600} mt=".2in">
          Subject: Agriculture Income
        </Text>

        <Text {...propsTitle} ta="center" td="underline" fw={600} mt=".08in">
          To Whom It May Concern
        </Text>

        <Space h=".35in" />

        <Text {...propsText} style={{ textAlign: "justify" }} lh={1.6}>
          This is to certify that the land with{" "}
          <b>Plot. No. {form.values?.land_plot_numbers}</b>, owned by{" "}
          <b>
            {form.values?.landowner_honorific} {form.values?.landowner_name}
          </b>{" "}
          ({form.values?.landowner_relationship}), located in{" "}
          <b>{form.values?.land_location}</b>, is utilized for agricultural
          purpose. This land is used to cultivate crops such as{" "}
          <b>{form.values?.crops}</b>. The agricultural activities carried out
          on this land are aimed at market production generating an annual
          income of approximately <b>NRs. {formattedIncome}</b> (In words:{" "}
          <b>{form.values?.annual_income_words}</b>). This certification
          confirms the significance of the agricultural operations conducted on
          this property, contributing substantially to the local economy and
          ensuring a steady income for the family.
        </Text>

        <Space h="1.5in" />

        <SimpleGrid cols={2}>
          <div />
          <div style={{ paddingLeft: ".7in" }}>
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

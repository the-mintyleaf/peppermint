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
import classes from "./relationship.module.css";
//pageprops
import { configPageProps } from "../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { wodaTextProps, wodaTitleProps } from "../wodaProps";

export function TemplateRelationshipVerification() {
  // * DEFINITION

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

  const lh = "19.5px";

  return (
    <>
      <Paper p=".6in" className={classes.root} {...configPageProps}>
        <Space h={state?.headerProps?.height + "in" || "1in"} />

        <Text
          {...propsTitle}
          ta="center"
          tt="uppercase"
          td="underline"
          fw={600}
        >
          Relationship Verification Certificate
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
            {details.applicant_honorific} {details.applicant_name}
          </b>
          , a permanent resident of <b>{details.applicant_permanent_address}</b>{" "}
          has the following relationship with the following persons as mentioned
          below.
        </Text>

        <Space h=".1in" />

        <Text
          style={{
            textAlign: "justify",
          }}
          {...propsText}
        >
          This certificate is issued according to the{" "}
          <b>{details.signature_issued_act_relationship}</b>
        </Text>

        <Space h=".12in" />

        <table className={classes.table}>
          <thead>
            <tr>
              <th>
                <Text lh={lh} fw={600}>
                  S.N.
                </Text>
              </th>
              <th>
                <Text lh={lh} fw={600}>
                  Name
                </Text>
              </th>
              <th>
                <Text lh={lh} fw={600}>
                  {" "}
                  Relationship
                </Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {details.applicant_guardians?.map(
              (guardianinfo: any, index: number) => (
                <tr key={index}>
                  <td style={{ textAlign: "center", maxWidth: ".05in" }}>
                    <Text lh={lh}>{index + 1}.</Text>
                  </td>
                  <td
                    style={{
                      width: "2.5in",
                    }}
                  >
                    <Text lh={lh}>
                      {guardianinfo.honorific} {guardianinfo.name}
                    </Text>
                  </td>
                  <td
                    style={{
                      width: "1.65in",
                    }}
                  >
                    <Text lh={lh}>Applicant's {guardianinfo.relationship}</Text>
                  </td>
                </tr>
              )
            )}
            <tr>
              <td style={{ textAlign: "center" }}>
                <Text lh={lh}>{details.applicant_guardians.length + 1}.</Text>
              </td>
              <td>
                <Text lh={lh}>
                  {details.applicant_honorific} {details.applicant_name}
                </Text>
              </td>
              <td>
                <Text lh={lh}>Applicant</Text>
              </td>
            </tr>
          </tbody>
        </table>

        <Space h=".07in" />

        <Text {...propsText}>
          The photographs of the persons mentioned above are attached below.
        </Text>

        <Space h=".12in" />

        <SimpleGrid cols={3}>
          <div>
            <Center>
              <Paper radius={0} bg="none" h="45mm" w="35mm"></Paper>
            </Center>
            <Text {...propsText} ta="center">
              {details.applicant_honorific}. {details.applicant_name}
            </Text>
            <Text {...propsText} ta="center">
              (Applicant)
            </Text>
          </div>
          <div>
            <Center>
              <Paper radius={0} bg="none" h="45mm" w="35mm"></Paper>
            </Center>
            <Text {...propsText} ta="center">
              {details.applicant_guardians[0].honorific}{" "}
              {details.applicant_guardians[0].name}
            </Text>
            <Text {...propsText} ta="center">
              Applicants Father
            </Text>
          </div>
          <div>
            <Center>
              <Paper radius={0} bg="none" h="45mm" w="35mm"></Paper>
            </Center>
            <Text {...propsText} ta="center">
              {details.applicant_guardians[1].honorific}{" "}
              {details.applicant_guardians[1].name}
            </Text>
            <Text {...propsText} ta="center">
              Applicant's Mother
            </Text>
          </div>
        </SimpleGrid>

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
              }}
            />

            <Text {...propsText} fw={600} ta="center" mt=".04in">
              {details.spokesperson_name}
            </Text>
            <Text {...propsText} fw={600} ta="center">
              {details.spokesperson_post}
            </Text>
            <Text {...propsText} fw={600} ta="center">
              Contact No.: {details.spokesperson_contact}
            </Text>
          </div>
        </SimpleGrid>
      </Paper>
    </>
  );
}

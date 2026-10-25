"use client";
import { useContext } from "react";
import { Group, Paper, Space, Text } from "@peppermint/ui";
import classes from "./affidavitFinancial.module.css";
import { configPageProps } from "../../templateprops";
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { wodaTextProps } from "../wodaProps";
import { WodaReferenceHeader } from "../WodaReferenceHeader";
import { FormHandler } from "@/components/framework/FormHandler";

export function TemplateAffidavitFinancial() {
  const form = FormHandler.useForm();
  const { state } = useContext(ContextEditor.Context);
  const v = form.values ?? {};
  const tp = wodaTextProps;

  const kinship = v.student_kinship || "daughter";
  const pronoun = v.student_pronoun === "him" ? "his" : "her";

  return (
    <Paper p=".6in" className={classes.root} {...configPageProps}>
      <Space h={state?.headerProps?.height + "in" || "1in"} />
      <WodaReferenceHeader values={v} />

      {/* Title */}
      <Text size="16px" fw={700} ta="center" color="black" lh=".27in" mb=".2in">
        (AFFIDAVITE OF FINANCIAL SUPPORT)
      </Text>

      {/* Opening paragraph */}
      <Text {...tp} lh=".27in" style={{ textAlign: "justify" }} mb=".15in">
        I, the undersigned{" "}
        <b>
          {v.sponsor_honorific} {v.sponsor_name}
        </b>{" "}
        ({v.sponsor_relation}), holder of Nepali Citizenship Certificate No.{" "}
        <b>{v.sponsor_citizenship_no}</b>, a family member of{" "}
        <b>
          {v.father_honorific} {v.father_name}
        </b>{" "}
        (father) and{" "}
        <b>
          {v.mother_honorific} {v.mother_name}
        </b>{" "}
        (Mother), Citizenship No. <b>{v.parent_citizenship_no}</b>, permanently
        residing at <b>{v.permanent_address}</b> do hereby solemnly affirm and
        declare as follows:
      </Text>

      {/* Numbered clauses */}
      <div style={{ paddingLeft: ".25in" }}>
        <Text {...tp} lh=".27in" style={{ textAlign: "justify" }} mb=".15in">
          1.{"  "}That my {kinship},{" "}
          <b>
            {v.student_honorific} {v.student_name}
          </b>
          , holder of Nepali Citizenship Certificate No.{" "}
          <b>{v.student_citizenship_no}</b>, National Identity Card No.{" "}
          <b>{v.student_nid_no}</b>, and Nepali Passport No.{" "}
          <b>{v.student_passport_no}</b>, is seeking admission to pursue the
          degree of{" "}
          <b>
            {v.course_level} in {v.course_name}
          </b>{" "}
          at <b>{v.institution_name}</b>, located in{" "}
          <b>{v.institution_location}</b>.
        </Text>

        <Text {...tp} lh=".27in" style={{ textAlign: "justify" }} mb=".15in">
          2.{"  "}That I hereby undertake and guarantee to provide full
          financial support for my {kinship},{" "}
          <b>
            {v.student_honorific} {v.student_name}
          </b>
          , covering all educational expenses including college tuition fees,
          accommodation, living, and other personal expenses, for the entire
          duration of {pronoun} studies at the said institution. The financial
          support will be jointly provided by {v.support_providers}.
        </Text>

        <Text {...tp} lh=".27in" style={{ textAlign: "justify" }} mb=".15in">
          3.{"  "}That this affidavit is executed in good faith with full
          knowledge of the legal obligations and the consequences that may arise
          from any false statement or misrepresentation contained herein.
        </Text>
      </div>

      <Space h=".5in" />

      {/* Three signatories in a row */}
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        {(
          [
            { name: v.signer1_name, rel: v.signer1_relation },
            { name: v.signer2_name, rel: v.signer2_relation },
            { name: v.signer3_name, rel: v.signer3_relation },
          ] as { name?: string; rel?: string }[]
        ).map((sig, i) => (
          <div key={i}>
            <Text {...tp}>Signature:............</Text>
            <Space h=".05in" />
            <Text {...tp} fw={600}>
              {sig.name}
            </Text>
            <Text {...tp}>({sig.rel})</Text>
          </div>
        ))}
      </Group>

      <Space h=".35in" />

      {/* Ward Chairman — right-aligned */}
      <div style={{ textAlign: "right" }}>
        <Text {...tp} mb="2px">
          Signature: .................
        </Text>
        {v.chairman_date && <Text {...tp}>{v.chairman_date}</Text>}
        <Text {...tp} fw={700}>
          {v.chairman_name}
        </Text>
        <Text {...tp}>Ward Chairman</Text>
      </div>
    </Paper>
  );
}

"use client";
import { useContext } from "react";
import { Divider, Group, Paper, Space, Text } from "@zetsel/ui";
import classes from "./affidavitFinancial.module.css";
import { configPageProps } from "../../templateprops";
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { wodaTextProps } from "../wodaProps";
import { FormHandler } from "@/components/framework/FormHandler";
import { getDaySuffix } from "@/components/helper/getDaySuffix";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fmtDateAD(s: string) {
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return (
    <>
      {d.getDate()}
      <span style={{ verticalAlign: "super", fontSize: 8 }}>{getDaySuffix(d.getDate())}</span>{" "}
      {monthNames[d.getMonth()]}, {d.getFullYear()}
    </>
  );
}

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

      {/* Ref / Date header */}
      <Group
        justify="space-between"
        align="flex-start"
        style={{ opacity: state?.headerProps?.enable ? 0 : 1 }}
      >
        <div>
          <Group gap="4px" mb="2px">
            <Text {...tp} fw={600}>Ref. No.:</Text>
            <Text {...tp}>{v.wodadoc_refno}</Text>
          </Group>
          <Group gap="4px">
            <Text {...tp} fw={600}>Dispatch No.:</Text>
            <Text {...tp}>{v.dispatch_no}</Text>
          </Group>
        </div>
        <div style={{ textAlign: "right" }}>
          <Text {...tp}>Date: {v.wodadoc_date_bs} B.S.</Text>
          <Text {...tp}>
            ({v.wodadoc_date
              ? fmtDateAD(v.wodadoc_date)
              : <span style={{ display: "inline-block", width: 100 }} />} A.D.)
          </Text>
        </div>
      </Group>

      <Divider
        opacity={!state.headerProps?.enableLine ? 1 : 0}
        size={1}
        color="dark.9"
        mt="xs"
        mb="xl"
      />

      {/* Title */}
      <Text size="16px" fw={700} ta="center" color="black" lh=".27in" mb=".2in">
        (AFFIDAVITE OF FINANCIAL SUPPORT)
      </Text>

      {/* Opening paragraph */}
      <Text {...tp} lh=".27in" style={{ textAlign: "justify" }} mb=".15in">
        I, the undersigned <b>{v.sponsor_honorific} {v.sponsor_name}</b> ({v.sponsor_relation}),
        holder of Nepali Citizenship Certificate No. <b>{v.sponsor_citizenship_no}</b>, a family
        member of <b>{v.father_honorific} {v.father_name}</b> (father) and{" "}
        <b>{v.mother_honorific} {v.mother_name}</b> (Mother), Citizenship No.{" "}
        <b>{v.parent_citizenship_no}</b>, permanently residing at <b>{v.permanent_address}</b> do
        hereby solemnly affirm and declare as follows:
      </Text>

      {/* Numbered clauses */}
      <div style={{ paddingLeft: ".25in" }}>
        <Text {...tp} lh=".27in" style={{ textAlign: "justify" }} mb=".15in">
          1.{"  "}That my {kinship}, <b>{v.student_honorific} {v.student_name}</b>, holder of
          Nepali Citizenship Certificate No. <b>{v.student_citizenship_no}</b>, National Identity
          Card No. <b>{v.student_nid_no}</b>, and Nepali Passport No. <b>{v.student_passport_no}</b>,
          is seeking admission to pursue the degree of{" "}
          <b>{v.course_level} in {v.course_name}</b> at <b>{v.institution_name}</b>, located
          in <b>{v.institution_location}</b>.
        </Text>

        <Text {...tp} lh=".27in" style={{ textAlign: "justify" }} mb=".15in">
          2.{"  "}That I hereby undertake and guarantee to provide full financial support for my{" "}
          {kinship}, <b>{v.student_honorific} {v.student_name}</b>, covering all educational
          expenses including college tuition fees, accommodation, living, and other personal
          expenses, for the entire duration of {pronoun} studies at the said institution. The
          financial support will be jointly provided by {v.support_providers}.
        </Text>

        <Text {...tp} lh=".27in" style={{ textAlign: "justify" }} mb=".15in">
          3.{"  "}That this affidavit is executed in good faith with full knowledge of the legal
          obligations and the consequences that may arise from any false statement or
          misrepresentation contained herein.
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
            <Text {...tp} fw={600}>{sig.name}</Text>
            <Text {...tp}>({sig.rel})</Text>
          </div>
        ))}
      </Group>

      <Space h=".35in" />

      {/* Ward Chairman — right-aligned */}
      <div style={{ textAlign: "right" }}>
        <Text {...tp} mb="2px">Signature: .................</Text>
        {v.chairman_date && <Text {...tp}>{v.chairman_date}</Text>}
        <Text {...tp} fw={700}>{v.chairman_name}</Text>
        <Text {...tp}>Ward Chairman</Text>
      </div>
    </Paper>
  );
}

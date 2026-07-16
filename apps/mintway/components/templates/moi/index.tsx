"use client";
import React, { useContext, type ReactNode } from "react";
import { Divider, Group, Paper, Space, Text } from "@peppermint/ui";
import classes from "./moi.module.css";
import { configPageProps } from "../templateprops";
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { FormHandler } from "@/components/framework/FormHandler";
import { getDaySuffix } from "@/components/helper/getDaySuffix";

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

const tp = { size: "15.4px", lh: ".2in", color: "black" } as const;

function fmtDate(s: string) {
  const d = new Date(s);
  return (
    <>
      {d.getDate()}
      <span style={{ verticalAlign: "super", fontSize: 8 }}>
        {getDaySuffix(d.getDate())}
      </span>{" "}
      {monthNames[d.getMonth()]}, {d.getFullYear()}
    </>
  );
}

function pr(pronoun = "him") {
  const m = pronoun !== "her";
  return {
    o: m ? "him" : "her",
    s: m ? "he" : "she",
    S: m ? "He" : "She",
    p: m ? "his" : "her",
    P: m ? "His" : "Her",
    r: m ? "himself" : "herself",
    t: m ? "Man" : "Woman",
  };
}

function P({ children }: { children: ReactNode }) {
  return (
    <Text {...tp} style={{ textAlign: "justify" }} lh={1.6} mb=".12in">
      {children}
    </Text>
  );
}

function Sig({
  name,
  title,
  institution,
  contact,
  email,
}: {
  name?: string;
  title?: string;
  institution?: string;
  contact?: string;
  email?: string;
}) {
  return (
    <div>
      <div
        style={{
          borderBottom: "2px dotted black",
          width: 200,
          marginBottom: ".04in",
        }}
      />
      {name && (
        <Text {...tp} fw={700}>
          {name}
        </Text>
      )}
      {title && (
        <Text {...tp} fw={600}>
          {title}
        </Text>
      )}
      {institution && <Text {...tp}>{institution}</Text>}
      {contact && <Text {...tp}>Ph.No.: {contact}</Text>}
      {email && <Text {...tp}>Email: {email}</Text>}
    </div>
  );
}

function MoiShell({ title, children }: { title: string; children: ReactNode }) {
  const form = FormHandler.useForm();
  const { state } = useContext(ContextEditor.Context);
  const d = form.values?.moi_date ? (
    fmtDate(form.values.moi_date)
  ) : (
    <span style={{ display: "inline-block", width: 120 }} />
  );

  return (
    <Paper p=".6in" className={classes.root} {...configPageProps}>
      <Space h={state?.headerProps?.height + "in" || "1in"} />

      <Group
        justify="space-between"
        align="flex-end"
        style={{ opacity: state?.headerProps?.enable ? 0 : 1 }}
      >
        <div>
          {form.values?.moi_letter_no && (
            <Group gap="4px" mb="2px">
              <Text {...tp} fw={600}>
                Letter No.:
              </Text>
              <Text {...tp}>{form.values.moi_letter_no}</Text>
            </Group>
          )}
          {form.values?.moi_ref_no && (
            <Group gap="4px">
              <Text {...tp} fw={600}>
                Ref. No.:
              </Text>
              <Text {...tp}>{form.values.moi_ref_no}</Text>
            </Group>
          )}
        </div>
        <Group gap="4px">
          <Text {...tp} fw={600}>
            Date:
          </Text>
          <Text {...tp}>{d}</Text>
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
        size="18px"
        fw={700}
        lh=".25in"
        color="black"
        ta="center"
        td="underline"
        mt=".2in"
        mb=".1in"
      >
        {title}
      </Text>

      <Space h=".25in" />

      {children}
    </Paper>
  );
}

// ─── 1. Global College of Management ─────────────────────────────────────────

export function TemplateMoiGlobalCollege() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const sl = form.values?.student_last_name || sn;

  return (
    <MoiShell title="Medium of Instruction">
      <P>
        This letter is on behalf of{" "}
        <b>
          {sh} {sn}
        </b>
        , who had studied in Grade-XI and Grade-XII in the Management stream in
        this College under National Examinations Board (NEB) of Nepal
        (equivalent to higher school degree in any country).
      </P>
      <P>
        Global College of Management is an exclusively English Medium
        institution where{" "}
        <b>
          {sh} {sl}
        </b>{" "}
        received {p.p} higher secondary education.{" "}
        <b>
          {sh} {sl}
        </b>{" "}
        possesses an excellent command of the English language, both written and
        spoken. {p.S} will not have any linguistic difficulties whatsoever for
        undertaking {p.p} studies through the English medium of instruction.
      </P>
      <Space h="1in" />
      <Sig
        name={form.values?.signatory_name}
        title="Principal"
        institution="Global College of Management"
        contact={form.values?.signatory_contact}
        email={form.values?.signatory_email}
      />
    </MoiShell>
  );
}

// ─── 2. Shree Janajagriti Secondary School ────────────────────────────────────

export function TemplateMoiJanajagriti() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const sl = form.values?.student_last_name || sn;
  const fh = form.values?.father_honorific || "";
  const fn_ = form.values?.father_name || "";
  const addr = form.values?.student_address || "";
  const yearBs = form.values?.completion_year_bs || "";
  const yearAd = form.values?.completion_year_ad || "";
  const cgpa = form.values?.student_cgpa || "";
  const regNo = form.values?.student_registration_no || "";
  const dob = form.values?.student_dob || "";

  return (
    <MoiShell title="LETTER OF MEDIUM OF INSTRUCTION">
      <P>
        This is to certify that{" "}
        <b>
          {sh} {sn}
        </b>{" "}
        son of{" "}
        <b>
          {fh} {fn_}
        </b>
        , permanent residence of <b>{addr}</b>, was a bona-fide student of{" "}
        <b>Shree Janajagriti Secondary School</b>, Tamakoshi -5, Shahare,
        Dolakha while {p.s} was a student of this school {p.s} was fully
        instructed in English Medium (i.e. Reading, Writing, Speaking and
        Listening).
      </P>
      <P>
        I have personally known {p.o} since {p.s} joined this school for two
        years. This is to inform that{" "}
        <b>
          {sh} {sl}
        </b>{" "}
        successfully completed School Level Certificate Examination (Grade XI &
        XII) in{" "}
        <b>
          {yearBs} B.S.({yearAd} A.D.)
        </b>{" "}
        with CGPA <b>{cgpa}</b>. {p.P} registration no is <b>{regNo}</b> and
        date of birth according to the school record is <b>{dob}</b>.
      </P>
      <P>
        I have found {p.o} as a brilliant student and extra ordinary eager to
        analyze issues related to {p.p} study from different perspectives. {p.S}{" "}
        is amicable young person, who display a great deal of initiative,
        together with a deep sense of responsibility toward {p.p} study.
      </P>
      <P>
        As an English teacher, I deeply appreciate {p.p} caliber and I would
        have no hesitation recommending {p.o} join any academic institution
        within the country or abroad for upgrading academic qualification. I
        wish all the best in {p.p} future endeavors.
      </P>
      <P>
        If needed any query, I will provide further information about {p.o}.
        Thank you for your consideration.
      </P>
      <Space h="1in" />
      <Sig
        name={form.values?.signatory_name}
        title="English Teacher"
        institution="Shree Janajagriti Secondary School"
      />
    </MoiShell>
  );
}

// ─── 3. Vinayak Health Care System ───────────────────────────────────────────

export function TemplateMoiVinayak() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const regNo = form.values?.student_registration_no || "";
  const dur = form.values?.study_duration || "";
  const prog = form.values?.program || "";
  const yr1 = form.values?.study_year_start || "";
  const yr2 = form.values?.study_year_end || "";

  return (
    <MoiShell title="Medium of Instruction (MOI)">
      <P>
        This is to certify that{" "}
        <b>
          {sh} {sn}
        </b>{" "}
        (CTEVT Registration No: <b>{regNo}</b>) was a student of this
        institution for <b>{dur}</b>-year Proficiency Certificate Level in{" "}
        <b>{prog}</b> program. {p.S} started {p.p} course in <b>{yr1} A.D.</b>{" "}
        and passed in <b>{yr2} A.D.</b> The course is affiliated to Council for
        Technical Education and Vocational Training (CTEVT).
      </P>
      <P>
        We further certify that medium of instruction for the entire duration of
        the course was English.
      </P>
      <P>We wish {p.o} success in future endeavors.</P>
      <Space h="1in" />
      <Sig
        name={form.values?.signatory_name}
        title="English Lecturer"
        institution="Vinayak Healthcare System"
        email={form.values?.signatory_email}
      />
    </MoiShell>
  );
}

// ─── 4. Reliance International Academy ───────────────────────────────────────

export function TemplateMoiReliance() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const sl = form.values?.student_last_name || sn;
  const fh = form.values?.father_honorific || "";
  const fn_ = form.values?.father_name || "";
  const addr = form.values?.student_address || "";
  const ay1 = form.values?.academic_year_start || "";
  const ay2 = form.values?.academic_year_end || "";
  const kinship =
    (form.values?.student_pronoun || "him") !== "her" ? "son" : "daughter";

  return (
    <MoiShell title="Subject: Medium of Instruction">
      <P>
        This is to certify that{" "}
        <b>
          {sh} {sn}
        </b>
        , {kinship} of{" "}
        <b>
          {fh} {fn_}
        </b>
        , inhabitant <b>{addr}</b> was a bona-fide student of grade XI & XII at
        this academy for the academic year{" "}
        <b>
          {ay1} to {ay2} A.D.
        </b>{" "}
        was a student of this academy. {p.S} has passed grade XI & XII from our
        academy.
      </P>
      <P>
        This is an English medium institute affiliated to National Examinations
        Board (NEB) of Nepal and is recognized by government of Nepal. All
        subjects beside Nepali is taught in English medium. {p.S} bears
        excellent Written English, Spoken English and Interaction ability in
        English.
      </P>
      <P>
        {sh} {sl} is quite proficient in English Language and can follow class
        lecture comfortably.
      </P>
      <P>
        I wish {p.o} all the best for {p.p} future endeavor and success.
      </P>
      <P>If you have any queries, Please feel free to contact us.</P>
      <Space h="1in" />
      <Sig
        name={form.values?.signatory_name}
        title="Program Coordinator"
        institution="Reliance International Academy"
        email={form.values?.signatory_email}
      />
    </MoiShell>
  );
}

// ─── 5. Bheri Nursing College ─────────────────────────────────────────────────

export function TemplateMoiBheriNursing() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const fh = form.values?.father_honorific || "";
  const fn_ = form.values?.father_name || "";
  const addr = form.values?.student_address || "";
  const regNo = form.values?.student_registration_no || "";
  const ay1 = form.values?.academic_year_start || "";
  const ay2 = form.values?.academic_year_end || "";
  const gy = form.values?.graduation_year || "";
  const kinship =
    (form.values?.student_pronoun || "him") !== "her" ? "son" : "daughter";

  return (
    <MoiShell title="Subject: Medium of Instruction">
      <Text
        size="18px"
        fw={700}
        lh=".25in"
        color="black"
        ta="center"
        mb=".15in"
      >
        TO WHOM IT MAY CONCERN
      </Text>
      <P>
        This is to certify that{" "}
        <b>
          {sh} {sn}
        </b>
        , {kinship} of{" "}
        <b>
          {fh} {fn_}
        </b>
        , an inhabitant of <b>{addr}</b>, was a student of Post Basic Bachelor
        of Nursing degree programme with Reg. No. <b>{regNo}</b>. During the
        year{" "}
        <b>
          {ay1}-{ay2}
        </b>{" "}
        at Bheri Nursing college Nepalgunj Banke which is affiliated to
        Purbanchal University.
      </P>
      <P>
        Since the medium of instruction in this college for entire subject is
        English Language. {p.S} has successfully completed {p.p} Post Basic
        Bachelor of Nursing (PBN) degree programme in the year <b>{gy}</b> with
        English Medium. {p.S} bears good listening, reading, writing and
        speaking skills in English. {p.S} is punctual, sincere and hardworking.
      </P>
      <P>
        I wish {p.o} every success in {p.p} future endeavor.
      </P>
      <Space h="1in" />
      <Sig
        name={form.values?.signatory_name}
        title="Campus Chief"
        institution="Bheri Nursing College Pvt. Ltd."
        contact={form.values?.signatory_contact}
      />
    </MoiShell>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export function TemplateMoi() {
  const form = FormHandler.useForm();
  const institution = String(form.values?.institution_name ?? "");

  if (institution.includes("Global College"))
    return <TemplateMoiGlobalCollege />;
  if (institution.includes("Janajagriti")) return <TemplateMoiJanajagriti />;
  if (institution.includes("Vinayak")) return <TemplateMoiVinayak />;
  if (institution.includes("Reliance")) return <TemplateMoiReliance />;
  if (institution.includes("Bheri Nursing")) return <TemplateMoiBheriNursing />;

  return <TemplateMoiGlobalCollege />;
}

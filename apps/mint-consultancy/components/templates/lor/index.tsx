"use client";
import React, { useContext, type ReactNode } from "react";
import { Divider, Group, Paper, Space, Text } from "@zetsel/ui";
import classes from "./lor.module.css";
import { configPageProps } from "../templateprops";
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { FormHandler } from "@/components/framework/FormHandler";
import { getDaySuffix } from "@/components/helper/getDaySuffix";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const tp = { size: "15.4px", lh: ".2in", color: "black" } as const;

function fmtDate(s: string) {
  const d = new Date(s);
  return (
    <>
      {d.getDate()}
      <span style={{ verticalAlign: "super", fontSize: 8 }}>{getDaySuffix(d.getDate())}</span>{" "}
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
  honorific, name, title, dept, institution, contact, email,
}: {
  honorific?: string; name?: string; title?: string; dept?: string;
  institution?: string; contact?: string; email?: string;
}) {
  return (
    <div>
      <div style={{ borderBottom: "2px dotted black", width: 200, marginBottom: ".04in" }} />
      {(honorific || name) && (
        <Text {...tp} fw={700}>{[honorific, name].filter(Boolean).join(" ")}</Text>
      )}
      {title && <Text {...tp} fw={600}>{title}</Text>}
      {dept && <Text {...tp}>{dept}</Text>}
      {institution && <Text {...tp}>{institution}</Text>}
      {contact && <Text {...tp}>Ph.No.: {contact}</Text>}
      {email && <Text {...tp}>Email: {email}</Text>}
    </div>
  );
}

function LorShell({
  title, salutation, children,
}: {
  title: string; salutation?: string; children: ReactNode;
}) {
  const form = FormHandler.useForm();
  const { state } = useContext(ContextEditor.Context);
  const d = form.values?.lor_date
    ? fmtDate(form.values.lor_date)
    : <span style={{ display: "inline-block", width: 120 }} />;

  return (
    <Paper p=".6in" className={classes.root} {...configPageProps}>
      <Space h={state?.headerProps?.height + "in" || "1in"} />

      <Group
        justify="space-between"
        align="flex-end"
        style={{ opacity: state?.headerProps?.enable ? 0 : 1 }}
      >
        <div>
          {form.values?.lor_letter_no && (
            <Group gap="4px" mb="2px">
              <Text {...tp} fw={600}>Letter No.:</Text>
              <Text {...tp}>{form.values.lor_letter_no}</Text>
            </Group>
          )}
          <Group gap="4px">
            <Text {...tp} fw={600}>Ref. No.:</Text>
            <Text {...tp}>{form.values?.lor_ref_no}</Text>
          </Group>
        </div>
        <Group gap="4px">
          <Text {...tp} fw={600}>Date:</Text>
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

      <Text size="18px" fw={700} lh=".25in" color="black" ta="center" td="underline" mt=".2in" mb=".1in">
        {title}
      </Text>

      <Space h=".25in" />

      {salutation && (
        <>
          <Text {...tp}>{salutation}</Text>
          <Space h=".1in" />
        </>
      )}

      {children}
    </Paper>
  );
}

// ─── 1. Shree Janajagriti Secondary School ───────────────────────────────────

export function TemplateJanajagriti() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const sl = form.values?.student_last_name || "";
  const ay1 = form.values?.academic_year_start || "";
  const ay2 = form.values?.academic_year_end || "";

  return (
    <LorShell title="LETTER OF RECOMMENDATION">
      <P>
        I am delighted to recommend <b>{sh} {sn}</b> whose sincerity and quest for knowledge
        led {p.o} as one of the best students throughout the academic year ({ay1} A.D. - {ay2} A.D.).
      </P>
      <P>
        <b>{sh} {sl}</b> is compassionate, energetic and genuinely well rounded, I have observed
        {" "}{p.p} motives and also attitude toward the school curriculum. {p.S} demonstrated
        impressive logical thinking abilities and intellectual curiosity. I am confident that {p.s}{" "}
        will continue to display excellent academic performance in the days to come.
      </P>
      <P>
        I expect {p.o} to respond the challenges of future education with a rigorous devoting to
        deep understanding, and I am certain that {p.p} intellect is capable enough to handle even
        the most demanding course available. {p.S} will distinguish {p.r} in challenging course
        work; and when confronted with complex issue, {p.s} will devote {p.r} and seek further
        clarification until {p.s} has a firm comprehension.
      </P>
      <P>With best wishes and blessings, I pray for {p.p} great prosperity and eternal happiness in the future.</P>
      <Space h="1in" />
      <Sig
        honorific={form.values?.recommender_honorific}
        name={form.values?.recommender_name}
        title={form.values?.recommender_title}
        institution="Shree Janajagriti Secondary School"
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

// ─── 2. Bageshwari Multiple Campus — Campus Chief ─────────────────────────────

export function TemplateBageshwariChief() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const fh = form.values?.father_honorific || "";
  const fn_ = form.values?.father_name || "";
  const addr = form.values?.student_address || "";
  const prog = form.values?.program || "";
  const deg = form.values?.degree_name || "";
  const ay1 = form.values?.academic_year_start || "";
  const ay2 = form.values?.academic_year_end || "";
  const gy = form.values?.graduation_year || "";

  return (
    <LorShell title="Letter of Recommendation" salutation="Dear sir,">
      <P>
        This is to certify that <b>{sh} {sn}</b>, son of <b>{fh} {fn_}</b>, a permanent
        resident of <b>{addr}</b>, was a regular student of this campus in <b>{prog}</b> stream
        for the academic year <b>{ay1} to {ay2} A.D.</b> {p.S} had successfully passed the{" "}
        <b>{deg}</b> Examination in the year <b>{gy} A.D.</b>
      </P>
      <P>
        The Medium of teaching in this college is English as well as Nepali and <b>{sh} {sn}</b>{" "}
        has an excellent proficiency level in English. I found {p.o} disciplined and sincere.
      </P>
      <P>
        During {p.p} study, {p.s} was found creative and enthusiastic student who participated in
        cocurricular activities as well. {p.S} was found creative and capable in {p.p} duties and
        responsibilities.
      </P>
      <P>
        However, {p.p} interest is not only limited to only logic and English. <b>{sh} {sn}</b> also
        excels in a number of extracurricular activities such as sports and speech. After college
        sessions, I often saw {p.o} rigorously practicing {p.p} speech and sports. {p.S} is not
        only an excellent speaker but also demonstrates wonderful teamwork. {p.P} dynamic and
        friendly nature is also well expressed in {p.p} behavior. I have not any complaint against {p.o}.
      </P>
      <P>
        {p.S} can act very wisely if {p.s} is given opportunity. I recommend {p.o} as an active
        and curious participant.
      </P>
      <P>I wish {p.o} good luck and success in {p.p} future endeavors.</P>
      <Space h="1in" />
      <Sig
        name={form.values?.recommender_name}
        title="Campus Chief"
        institution="Bageshwari Multiple Campus"
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

// ─── 3. Bageshwari Multiple Campus — Head of Faculty ─────────────────────────

export function TemplateBageshwariHod() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const sf = form.values?.student_first_name || "";
  const sl = form.values?.student_last_name || "";

  return (
    <LorShell title="To Whom It May Concern">
      <P>
        I am writing to recommend <b>{sh} {sn}</b>, whom I have had the privilege of knowing for
        the past three years during {p.p} tenure as a student at Bageshwari Multiple Campus. In
        my capacity as a faculty head, I have consistently been impressed by <b>{sf}</b>'s
        boundless enthusiasm and innovative approach to {p.p} academic pursuits. {p.P} exceptional
        aptitude for English and Business Studies is truly noteworthy, and it is with great
        confidence that I endorse {p.p} application for graduate studies at your esteemed University.
      </P>
      <P>
        <b>{sh} {sl}</b> possesses a remarkable ability to quickly grasp complex concepts and
        demonstrates an unwavering sense of responsibility towards {p.p} tasks. Not only does{" "}
        {p.s} consistently complete assignments within stipulated timeframes, but also consistently
        delivers work of exceptional quality, marked by its originality and value addition.
      </P>
      <P>
        Beyond {p.p} academic accomplishments, <b>{sf}</b> successfully strikes a balance between
        {p.p} studies and extracurricular engagements. {p.S} has also completed {p.p} tenure of
        three years as a college representative. {p.S} exhibits a dynamic and versatile personality
        that sets {p.o} apart. However, what truly distinguishes {p.o} and leads me to recommend
        {" "}{p.o} for the graduate program is {p.p} genuine passion for the field. This enthusiasm
        sets {p.o} apart from {p.p} peers and positions {p.o} as a natural leader within the classroom.
      </P>
      <P>
        Based on {p.p} consistently outstanding performance, I am confident that <b>{sf}</b>{" "}
        possesses the requisite qualities and potential to excel in a higher education setting,
        particularly at your esteemed institution. I strongly endorse <b>{sh} {sn}</b> application
        for both the graduate program and any potential scholarship opportunities.
      </P>
      <P>If you have any question about {p.o} and on this letter, please feel free to contact me.</P>
      <P>I wish {p.o} success.</P>
      <Space h="1in" />
      <Sig
        honorific={form.values?.recommender_honorific}
        name={form.values?.recommender_name}
        title="Head of Faculty"
        institution="Bageshwari Multiple Campus"
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

// ─── 4. Shree Shiva Secondary School ─────────────────────────────────────────

export function TemplateShiva() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sn = form.values?.student_name || "";
  const sl = form.values?.student_last_name || "";
  const grade = form.values?.grade || "";
  const year = form.values?.year_of_completion || "";

  return (
    <LorShell title="Recommendation Letter">
      <P>
        I am very pleased to write this letter of recommendation for <b>{sn}</b> who completed
        Grade <b>{grade}</b> of year <b>{year}</b>. A bone fide student of the school. I have
        known <b>{sn}</b> since the start of school level. <b>{sn}</b> is a hardworking student
        and shows {p.p} determination for the task in hand. {p.S} has proven {p.p} worth through
        {p.p} punctuality and professionalism.
      </P>
      <P>
        <b>{sn}</b> is a promising student who is highly committed towards {p.p} work. I have had
        an opportunity to observe {p.p} participation and interaction to evaluate {p.p} knowledge
        of the subject matter. I believe that {p.s} is capable of further study. {p.P} qualities
        along with {p.p} dedication towards learning and initiative to lead has convinced me that{" "}
        <b>{sn}</b> will thrive in a highly competitive and intellectual environment.
      </P>
      <P>
        I have found <b>{sn}</b> to be a bright and engaging student making {p.o} an excellent
        candidate for higher education. I am confident that {p.s} will continue to excel in the
        field of {p.p} study and would strongly recommend you consider {p.o} as a potential
        candidate for your graduate level study in your esteemed institution.
      </P>
      <Space h="1in" />
      <Sig
        name={form.values?.recommender_name}
        title={form.values?.recommender_title || "Principal"}
        institution="Shree Shiva Secondary School"
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

// ─── 5. Kantipur College of Management & Information Technology (KCMIT) ───────

export function TemplateKcmit() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const fh = form.values?.father_honorific || "";
  const fn_ = form.values?.father_name || "";
  const prog = form.values?.program || "";
  const progFull = form.values?.program_full_name || "";
  const ay1 = form.values?.academic_year_start || "";
  const ay2 = form.values?.academic_year_end || "";
  const interests = form.values?.student_interests || "";

  return (
    <LorShell title="TO WHOM IT MAY CONCERN">
      <P>
        This is to certify that <b>{sh} {sn}</b>, son of <b>{fh} {fn_}</b>, was a bonafide
        student of this college studying a four year <b>{prog}</b> course ({progFull}) affiliated
        to Tribhuvan University in the academic years <b>{ay1} to {ay2} AD</b>. I taught {p.o}{" "}
        English and Business Communication in the first and second semesters respectively. I know
        {p.o} very well and know nothing against {p.p} character that will impede {p.p} higher
        studies. As a student, {p.s} was very amiable, helpful, cooperative, and very polite.{" "}
        {p.S} respected {p.p} seniors and teachers. {p.S} was a hard working student. {p.S}{" "}
        always took active participation in classroom discussions and always completed the tasks
        given to {p.o}. {p.S} is fluent and proficient in both spoken and written English as{" "}
        {p.p} education at school and college has been in English medium. {p.P} areas of interest
        lie in <b>{interests}</b>.
      </P>
      <P>
        I understand {p.s} wishes to take up further studies. I recommend {p.o} as a good, highly
        disciplined student, who is competent enough to take up the challenges of higher studies.
        I wish {p.o} all the best in {p.p} future ventures. If you require more information about
        {p.o}, I am ready to furnish.
      </P>
      <Space h="1in" />
      <Sig
        honorific={form.values?.recommender_honorific}
        name={form.values?.recommender_name}
        title={form.values?.recommender_title}
        dept={form.values?.recommender_dept}
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

// ─── 6. Tri-Chandra Multiple Campus ───────────────────────────────────────────

export function TemplateTriChandra() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const sf = form.values?.student_first_name || "";
  const ay1 = form.values?.academic_year_start || "";
  const ay2 = form.values?.academic_year_end || "";

  return (
    <LorShell title="RECOMMENDATION LETTER">
      <P>
        It gives me immense pleasure in recommending <b>{sh} {sn}</b> for admission in your
        institution for graduate program. I have known {p.o} for four years <b>{ay1}–{ay2}</b>{" "}
        in my capacity as {p.p} teacher, Department of{" "}
        <b>{form.values?.recommender_dept || "the department"}</b>.
      </P>
      <P>
        During my teaching period, I have found {p.o} a sincere, respectful, keen and intelligent
        student. {p.P} moral character is good to the best of my knowledge. As per {p.p} performance
        records, {p.s} is placed amongst the good students in the class. {p.S} is hardworking,
        clever and yearns to gain an in-depth knowledge, and is the student who always aspired to
        achieving very high standards.
      </P>
      <P>
        With {p.p} determination and hard work, I have no doubt that {p.s} will succeed in all{" "}
        {p.p} endeavors. I give <b>{sf || sn}</b> a high recommendation for {p.p} further studies
        to your University.
      </P>
      <P>I wish {p.o} all the best.</P>
      <Space h="1in" />
      <Sig
        honorific={form.values?.recommender_honorific}
        name={form.values?.recommender_name}
        title={form.values?.recommender_title || "Professor"}
        dept={form.values?.recommender_dept}
        institution="Tri-Chandra Multiple Campus"
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

// ─── 7. Monastic Secondary English Boarding School ────────────────────────────

export function TemplateMonastic() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const sl = form.values?.student_last_name || "";

  return (
    <LorShell title="To Whom It May Concern">
      <P>
        As a teacher of Monastic S. E. B. School. I have had the pleasure of knowing{" "}
        <b>{sh} {sn}</b> for the last two years. {p.S} has been an excellent student and an asset
        to our school. I would like to take this opportunity to recommend <b>{sl || sn}</b> for{" "}
        {p.p} further studies.
      </P>
      <P>
        I feel confident that {p.s} will continue to succeed in {p.p} studies.{" "}
        <b>{sl || sn}</b> is a dedicated and hardworking student and {p.s} has always attained
        very good grades. In class, {p.s} has proven to be a wonderful student. {p.S} is able to
        apply theoretical knowledge in practical life.
      </P>
      <P>
        For these reasons, I highly recommend <b>{sl || sn}</b> as a candidate for {p.p} further
        studies. {p.P} ability will truly be an asset to your college. I am sure that if {p.s}{" "}
        gets an opportunity to study in your college, {p.s} will prove {p.r} importance.
      </P>
      <Text {...tp} mb=".12in">Sincerely</Text>
      <Space h="1in" />
      <Sig
        name={form.values?.recommender_name}
        title={form.values?.recommender_title || "English Department Head"}
        institution="Monastic Secondary English Boarding School, Janakpur"
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

// ─── 8. Om Health Campus ─────────────────────────────────────────────────────

export function TemplateOmHealth() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const sl = form.values?.student_last_name || "";
  const prog = form.values?.program || "";
  const dur = form.values?.study_duration || "";
  const yr = form.values?.study_year_start || "";

  return (
    <LorShell title="TO WHOM IT MAY CONCERN">
      <P>
        I am extremely pleased to recommend <b>{sh} {sn}</b> as a deserving candidate for
        pursuing {p.p} studies.
      </P>
      <P>
        <b>{sh} {sl}</b> has been in very close association with me since {p.s} joined our campus
        in course of {p.p} studies in <b>{prog}</b>, {dur} year program in the year <b>{yr}</b>.
      </P>
      <P>
        During {p.p} study period, {p.p} academic involvement remained good. I found {p.o} very
        well in class performance, clinical exposures, project works, presentations and
        extracurricular activities. Furthermore, {p.p} interest and attitude truly prove {p.p}{" "}
        inclination towards the field.
      </P>
      <P>
        Barring all these, {p.s} was found to be self-driven, devoted and sincere to the studies.
        {" "}{p.S} keeps the ability and competence to do lot more if {p.s} joins any institution
        for {p.p} further studies.
      </P>
      <P>I wish all the best in {p.p} every future endeavor.</P>
      <Space h="1in" />
      <Sig
        honorific={form.values?.recommender_honorific}
        name={form.values?.recommender_name}
        title={form.values?.recommender_title || "Act. Principal"}
        institution="Om Health Campus (P.) Ltd."
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

// ─── 9. Atlantic International College ───────────────────────────────────────

export function TemplateAtlantic() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const sl = form.values?.student_last_name || "";
  const gy = form.values?.graduation_year || "";
  const deg = form.values?.degree_name || "";
  const sems = form.values?.teaching_semesters || "";
  const subjs = form.values?.teaching_subjects || "";
  const field = form.values?.study_field || "";
  const target = form.values?.target_program || "";

  return (
    <LorShell title="To Whom It May Concern">
      <P>
        This is to certify that <b>{sh} {sn}</b> was a genuine student of Atlantic International
        College, affiliated to Pokhara University, Nepal. {p.S} graduated from our college in{" "}
        <b>{gy}</b> with a <b>{deg}</b> degree, achieving excellent results.
      </P>
      <P>
        It was a pleasure teaching {p.o} during the <b>{sems}</b> semesters in subjects such as{" "}
        <b>{subjs}</b>. Throughout {p.p} time at the college, <b>{sh} {sl}</b> consistently
        demonstrated enthusiasm, energy, and a strong focus on achieving {p.p} goals with
        exceptional effort.
      </P>
      <P>
        {p.S} has shown adaptability to various working styles, making {p.o} a valuable addition
        to any academic or professional environment. I am confident that {p.p} strong work ethic
        and enthusiasm for <b>{field}</b> will contribute significantly to {p.p} success in the program.
      </P>
      <P>
        Therefore, I am delighted to recommend <b>{sh} {sn}</b> for admission to your esteemed
        university's <b>{target}</b>.
      </P>
      <Text {...tp} mb=".12in">Sincerely,</Text>
      <Space h="1in" />
      <Sig
        honorific={form.values?.recommender_honorific}
        name={form.values?.recommender_name}
        title={form.values?.recommender_title || "Principal"}
        institution="Atlantic International College"
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

// ─── 10. Model College of Technical Education ─────────────────────────────────

export function TemplateModelTechnical() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sh = form.values?.student_honorific || "";
  const sn = form.values?.student_name || "";
  const regNo = form.values?.student_registration_no || "";
  const dob = form.values?.student_dob || "";
  const qual = form.values?.qualification || "";
  const qualYr = form.values?.qualification_year || "";

  return (
    <LorShell title="LETTER OF RECOMMENDATION">
      <P>
        This is to certify that <b>{sh} {sn}</b> was a student of Model College of Technical
        Education. {p.P} Registration no. <b>{regNo}</b> and date of birth <b>{dob} AD</b>.{" "}
        {p.S} has completed {p.p} <b>{qual}</b> examination in <b>{qualYr}</b>. {p.S} has good
        command on reading, writing, listening, and speaking in English.
      </P>
      <P>
        As far I know, {p.s} is very honest, punctual and attentive to {p.p} duties and
        responsibilities. {p.S} is a very hard working young {p.t} with good moral sense.
      </P>
      <P>
        It is strongly recommended that {p.s} will be able to prove {p.r} as an excellent
        candidate for {p.p} higher study.
      </P>
      <Space h="1in" />
      <Sig
        name={form.values?.recommender_name}
        title={form.values?.recommender_title || "Principal"}
        institution="Model College of Technical Education Pvt.Ltd."
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

// ─── 11. Nepalgunj Technical College ──────────────────────────────────────────

export function TemplateNepalgunj() {
  const form = FormHandler.useForm();
  const p = pr(form.values?.student_pronoun);
  const sn = form.values?.student_name || "";
  const sf = form.values?.student_first_name || "";
  const subj = form.values?.subject || "";
  const dur = form.values?.study_duration || "";
  const ay1 = form.values?.academic_year_start || "";
  const ay2 = form.values?.academic_year_end || "";

  return (
    <LorShell title="To Whom It May Concern">
      <P>
        As a teacher of <b>{subj}</b>, I am delighted to recommend <b>{sn}</b> to your institution.
        I taught {p.o} for <b>{dur}</b> years from <b>{ay1} to {ay2} AD</b> and found {p.o} to
        be a hardworking and dedicated student. {p.S} used to do {p.p} assignment regularly, was
        punctual and disciplined and loved to participate in classroom.
      </P>
      <P>
        I have been impressed by <b>{sf || sn}</b>'s problem solving skills, curiosity, creativity
        and desire to excel. {p.P} class participation and attendance were good as well, and{" "}
        {p.s} has a number of personal characteristics that would enrich any academic community.{" "}
        {p.S} is amicable, diligent and a helpful student and was liked by all {p.p} friends.{" "}
        {p.S} has immense enthusiasm and a deep desire to succeed.
      </P>
      <P>
        I believe that <b>{sf || sn}</b>'s perseverance, intellectual ability and enthusiasm for
        learning and working are qualities that help {p.o} well in {p.p} future. {p.P} efforts,
        combined with {p.p} work ethic and ability to self-improve, are recipes for success in the
        years to come.
      </P>
      <P>
        I give {p.o} the highest recommendation and wish {p.o} best of luck in all {p.p} future
        endeavors.
      </P>
      <Space h="1in" />
      <Sig
        honorific={form.values?.recommender_honorific}
        name={form.values?.recommender_name}
        title={form.values?.recommender_title || "Principal"}
        institution="Nepalgunj Technical College"
        contact={form.values?.recommender_contact}
        email={form.values?.recommender_email}
      />
    </LorShell>
  );
}

"use client";

import React from "react";
import { Paper } from "@peppermint/ui";
import type { CvContent } from "@/modules/documents/documents.types";
import {
  DEFAULT_EUROPASS_APPEARANCE,
  fontStackFor,
  readableTextColor,
  resolveHeaderColor,
} from "./appearance";
import styles from "./template.module.css";

type Data = CvContent & Record<string, unknown>;

export interface TemplateStudentCVEuropassProps {
  data?: Record<string, unknown>;
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className={styles.sectionHead}>
      <span className={styles.sectionDot} aria-hidden />
      <h2 className={styles.sectionTitle}>{title}</h2>
      <hr className={styles.sectionRule} aria-hidden />
    </div>
  );
}

function toLines(value: string | undefined): string[] {
  if (!value) return [];
  const byNewline = value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (byNewline.length > 1) return byNewline;
  return value
    .split("|")
    .map((l) => l.trim())
    .filter(Boolean);
}

function buildPersonalInfo(d: Data): Array<{ label: string; value: string }> {
  const rows: Array<[string, string | undefined]> = [
    ["Passport", d.passport_number],
    ["Date of birth", d.date_of_birth],
    ["Place of birth", d.place_of_birth],
    ["Nationality", d.nationality],
    ["Gender", d.gender],
    ["Phone", d.contact ? `${d.contact} (Mobile)` : undefined],
    ["Email address", d.email],
    ["Address", d.current_address ? `${d.current_address} (Home)` : undefined],
  ];
  return rows
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => ({ label, value: value as string }));
}

const CEFR_COLUMNS = [
  "listening",
  "reading",
  "spoken_production",
  "spoken_interaction",
  "writing",
] as const;

export function TemplateStudentCVEuropass({
  data,
}: TemplateStudentCVEuropassProps) {
  const d = (data ?? {}) as Data;
  const appearance = {
    ...DEFAULT_EUROPASS_APPEARANCE,
    ...(d.appearance ?? {}),
  };
  const font = fontStackFor(appearance.fontFamily);
  const headerBg = resolveHeaderColor(
    appearance.headerColor,
    appearance.headerBrightness,
  );
  const headerText = readableTextColor(headerBg);

  const name = String(d.full_name || "").trim();
  const image = typeof d.image === "string" ? d.image : "";
  const personalInfo = buildPersonalInfo(d);
  const educations = d.educations ?? [];
  const experiences = d.experiences ?? [];
  const skills = toLines(d.skills);
  const languages = (d.languages ?? []).filter((l) => l && l.language?.trim());

  return (
    <Paper
      data-print-page
      radius={0}
      className={styles.page}
      style={{ fontFamily: font }}
    >
      <header
        className={styles.header}
        style={{ background: headerBg, color: headerText }}
      >
        <div className={styles.photoWrap}>
          {image ? (
            // Student photos are dynamic external URLs — a plain <img> is correct here.
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.photo} src={image} alt={name || "Photo"} />
          ) : (
            <div className={styles.photoPlaceholder} aria-hidden />
          )}
        </div>

        <div className={styles.infoCol}>
          <div className={styles.topRow}>
            <h1 className={styles.name}>{name}</h1>
            <div className={styles.mark} aria-label="Europass">
              <span className={styles.markFlag} aria-hidden>
                ★
              </span>
              <span>europass</span>
            </div>
          </div>
          <hr className={styles.headerRule} aria-hidden />
          {personalInfo.length > 0 && (
            <p className={styles.personalInfo}>
              {personalInfo.map((seg, i) => (
                <React.Fragment key={seg.label}>
                  {i > 0 && " | "}
                  <b>{seg.label}:</b> {seg.value}
                </React.Fragment>
              ))}
            </p>
          )}
        </div>
      </header>

      <div className={styles.body}>
        {d.summary?.trim() && (
          <section className={styles.section}>
            <SectionHead title="About Myself" />
            <div className={styles.sectionBody}>{d.summary}</div>
          </section>
        )}

        {educations.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="Education & Training" />
            <div className={styles.sectionBody}>
              {educations.map((edu, i) => (
                <div key={i} className={styles.entry}>
                  <div className={styles.entryMeta}>
                    {[edu.start_period, edu.end_period]
                      .filter(Boolean)
                      .join(" - ")}
                    {edu.field_of_study ? `  ·  ${edu.field_of_study}` : ""}
                    {edu.gpa ? `  ·  GPA ${edu.gpa}` : ""}
                  </div>
                  <div className={styles.entryTitle}>
                    {[edu.degree, edu.institution].filter(Boolean).join(" — ")}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {experiences.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="Work Experience" />
            <div className={styles.sectionBody}>
              {experiences.map((exp, i) => {
                const bullets = toLines(exp.description);
                return (
                  <div key={i} className={styles.entry}>
                    <div className={styles.entryMeta}>
                      {[exp.start_period, exp.end_period || "CURRENT"]
                        .filter(Boolean)
                        .join(" - ")}
                    </div>
                    <div className={styles.entryTitle}>
                      {[exp.role, exp.company].filter(Boolean).join(" — ")}
                    </div>
                    {bullets.length > 0 && (
                      <ul className={styles.bullets}>
                        {bullets.map((b, j) => (
                          <li key={j}>{b.replace(/^[•\-]\s*/, "")}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="Skills" />
            <div className={styles.skills}>{skills.join(" | ")}</div>
          </section>
        )}

        {(languages.length > 0 || d.mother_tongue?.trim()) && (
          <section className={styles.section}>
            <SectionHead title="Language Skills" />
            <div className={styles.sectionBody}>
              {d.mother_tongue?.trim() && (
                <p style={{ margin: "0 0 6px" }}>
                  <b>Mother tongue(s):</b> {d.mother_tongue}
                </p>
              )}
              {languages.length > 0 && (
                <>
                  <table className={styles.langTable}>
                    <thead>
                      <tr>
                        <th aria-label="Language" />
                        <th colSpan={2}>UNDERSTANDING</th>
                        <th colSpan={2}>SPEAKING</th>
                        <th rowSpan={2}>WRITING</th>
                      </tr>
                      <tr>
                        <th aria-label="Language" />
                        <th>Listening</th>
                        <th>Reading</th>
                        <th>Spoken production</th>
                        <th>Spoken interaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {languages.map((lang, i) => (
                        <tr key={i}>
                          <td className={styles.langName}>{lang.language}</td>
                          {CEFR_COLUMNS.map((col) => (
                            <td key={col}>{lang[col] || "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className={styles.legend}>
                    Levels: A1 and A2: Basic user - B1 and B2: Independent user
                    - C1 and C2: Proficient user
                  </p>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </Paper>
  );
}

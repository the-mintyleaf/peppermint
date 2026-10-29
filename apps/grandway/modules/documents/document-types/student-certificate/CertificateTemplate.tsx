"use client";

import {
  DocumentContextProvider,
  type StudentCertificateData,
} from "@/context/DocumentContext";
import { TemplateStudentCertificate } from "@/components/templates/student-certificate";
import { useCertificateSignatures } from "../../hooks/useCertificateSignatures";
import {
  normalizeCertificateContent,
  type CertificateFields,
} from "./certificateContent";
import { useCertificatePhoto } from "./useCertificatePhoto";
import type {
  DocumentTemplateProps,
  CertificateContent,
} from "../../documents.types";

/** Resolved fields → the template's render shape. */
function toCertificateData(
  f: CertificateFields,
  image: string,
): StudentCertificateData {
  return {
    firstname: f.firstname,
    middlename: f.middlename,
    lastname: f.lastname,
    date_of_birth: f.date_of_birth,
    gender: f.gender,
    address: f.address,
    date_of_admission: f.date_of_admission,
    date_of_completion: f.date_of_completion,
    issue: f.issue,
    course_name: f.course_name,
    course_level: f.course_level,
    course_books: f.course_books,
    course_total_days: f.course_total_days ?? 0,
    course_hours_per_day: f.course_hours_per_day ?? 0,
    grades: { ...f.grades },
    study_type: f.study_type,
    image,
    branch_name: f.branch_name,
    branch_no: f.branch_no,
    marking: f.marking,
  };
}

/**
 * The certificate adapter. Reads content through `normalizeCertificateContent`,
 * so a certificate saved under the pre-2026-10-29 keys (and a print snapshot of
 * one) renders exactly as one saved under the validated keys.
 */
export function CertificateTemplate(props: DocumentTemplateProps) {
  const content = (props.historicalSnapshot?.content ??
    props.document.content) as CertificateContent;
  const fields = normalizeCertificateContent(content);
  const image = useCertificatePhoto(
    fields.photo_media_id,
    content.image,
    props.studentFullData,
  );
  const certData = toCertificateData(fields, image);
  const selectedInstructor = fields.instructor_id;
  const selectedDirector = fields.director_id;

  // Only the two named signatories are resolved, and their images are fetched
  // here rather than in the template — uploaded bytes need an authenticated
  // request, which a presentational component has no business making.
  const signatures = useCertificateSignatures(
    props.signatures,
    selectedInstructor,
    selectedDirector,
  );

  return (
    <DocumentContextProvider documentData={certData}>
      <TemplateStudentCertificate
        selectedInstructor={selectedInstructor}
        selectedDirector={selectedDirector}
        signatures={signatures}
        overrideData={certData}
      />
    </DocumentContextProvider>
  );
}

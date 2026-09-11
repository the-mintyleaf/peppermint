"use client";

import {
  DocumentContextProvider,
  type StudentCertificateData,
} from "@/context/DocumentContext";
import { TemplateStudentCertificate } from "@/components/templates/student-certificate";
import { useCertificateSignatures } from "../../hooks/useCertificateSignatures";
import type {
  DocumentTemplateProps,
  CertificateContent,
} from "../../documents.types";

export function CertificateTemplate(props: DocumentTemplateProps) {
  const content = (props.historicalSnapshot?.content ??
    props.document.content) as CertificateContent;
  // Same precedence as the CV adapter: a URL stored on the document overrides,
  // otherwise the applicant's photograph fills the portrait box.
  const certData = {
    ...content,
    image: content.image || props.studentFullData?.photoUrl || "",
  } as StudentCertificateData;
  const selectedInstructor = content.instructorId
    ? String(content.instructorId)
    : null;
  const selectedDirector = content.directorId
    ? String(content.directorId)
    : null;

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
